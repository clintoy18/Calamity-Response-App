const CACHE_NAME = "osm-tiles-v2";
const TILE_ORIGINS = [
  "https://a.tile.openstreetmap.org",
  "https://b.tile.openstreetmap.org",
  "https://c.tile.openstreetmap.org"
];

const isTileRequest = (url) => {
  return TILE_ORIGINS.some(origin => url.origin === origin);
};

const createFallbackTile = () => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>
    <rect width='256' height='256' fill='#eee'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#999' font-size='16'>
      Tile Missing
    </text>
  </svg>`;
  
  return new Response(svg, {
    status: 200,
    statusText: "OK",
    headers: { 
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache"
    }
  });
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (!isTileRequest(url)) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(event.request);
        
        if (cached) {
          return cached;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(event.request, {
          mode: "no-cors",
          credentials: "omit",
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response && (response.ok || response.type === "opaque")) {
          const responseToCache = response.clone();
          cache.put(event.request, responseToCache).catch((err) => {
            console.warn("Cache storage failed:", err.name);
          });
        }

        return response;
      } catch (err) {
        console.warn("Tile fetch failed:", err.name);
        return createFallbackTile();
      }
    })()
  );
});