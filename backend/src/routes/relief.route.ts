// src/routes/emergencies.route.ts
import express, { Request, Response } from "express";
import axios from "axios";
import cheerio, { CheerioAPI } from "cheerio";
import https from "https";
import type { Element } from "domhandler";

const router = express.Router();

// -------------------- CACHE --------------------
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
let cachedData: any = null;
let lastFetch = 0;

// -------------------- TYPES --------------------
interface Location {
  name: string;
  lat: number;
  lon: number;
  population: number;
}

interface Earthquake {
  dateTime: string;
  parsedDate: string;
  latitude: number;
  longitude: number;
  depth: string;
  magnitude: number;
  location: string;
  source: string;
}

interface Impact {
  level: string;
  needsRescue: boolean;
  needsRelief: boolean;
  priority: number;
  estimatedIntensity: string;
}

interface AffectedArea {
  location: string;
  population: number;
  coordinates: { lat: number; lon: number };
  distance: string;
  impactLevel: string;
  estimatedIntensity: string;
  needsRescue: boolean;
  needsRelief: boolean;
  priority: number;
  recommendations: string[];
  causingEarthquake: { magnitude: number; location: string; dateTime: string; depth: string };
}

// -------------------- LOCATIONS --------------------
const CEBU_LOCATIONS: Location[] = [
  { name: "Bogo City", lat: 11.0489, lon: 124.0058, population: 88867 },
  { name: "San Remigio", lat: 11.0667, lon: 123.9333, population: 61907 },
  { name: "Daanbantayan", lat: 11.25, lon: 124.0097, population: 90353 },
  { name: "Medellin", lat: 11.1289, lon: 123.9594, population: 61610 },
  { name: "Tabuelan", lat: 10.8333, lon: 123.8667, population: 29466 },
  { name: "Tabogon", lat: 10.9333, lon: 124.0333, population: 36930 },
  { name: "Sogod", lat: 10.75, lon: 124, population: 34008 },
  { name: "Borbon", lat: 10.8386, lon: 124.0261, population: 42153 },
  { name: "Catmon", lat: 10.7169, lon: 123.9511, population: 33087 },
  { name: "Carmen", lat: 10.5892, lon: 124.0308, population: 57897 },
  { name: "Bantayan", lat: 11.1667, lon: 123.7167, population: 145436 },
  { name: "Santa Fe", lat: 11.15, lon: 123.8, population: 33654 },
  { name: "Madridejos", lat: 11.2667, lon: 123.7333, population: 39857 },
  { name: "Cebu City", lat: 10.3157, lon: 123.8854, population: 964169 },
  { name: "Mandaue City", lat: 10.3237, lon: 123.9223, population: 362654 },
  { name: "Lapu-Lapu City", lat: 10.3103, lon: 123.9494, population: 497604 },
  { name: "Danao City", lat: 10.5195, lon: 124.0294, population: 156321 },
  { name: "Toledo City", lat: 10.3778, lon: 123.6394, population: 207314 },
  { name: "Talisay City", lat: 10.2449, lon: 123.8492, population: 263048 },
  { name: "Consolacion", lat: 10.3781, lon: 123.9567, population: 148012 },
  { name: "Liloan", lat: 10.3931, lon: 123.9994, population: 134150 },
  { name: "Compostela", lat: 10.4522, lon: 124.0172, population: 58301 },
  { name: "Minglanilla", lat: 10.2456, lon: 123.7972, population: 151002 },
  { name: "Naga City", lat: 10.2086, lon: 123.7586, population: 133184 },
  { name: "Carcar City", lat: 10.1078, lon: 123.6378, population: 136453 },
  { name: "San Fernando", lat: 10.1631, lon: 123.7094, population: 72224 },
  { name: "Sibonga", lat: 10, lon: 123.5667, population: 57056 },
  { name: "Argao", lat: 9.8814, lon: 123.6064, population: 78187 },
  { name: "Dalaguete", lat: 9.7617, lon: 123.5353, population: 72294 },
  { name: "Alcoy", lat: 9.6833, lon: 123.5, population: 20316 },
];

// -------------------- UTILS --------------------
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateImpact(magnitude: number, distance: number): Impact {
  let impact: Impact = { level: "MINIMAL", needsRescue: false, needsRelief: false, priority: 10, estimatedIntensity: "I-II" };

  if (magnitude >= 6.5) {
    if (distance < 30) impact = { level: "CRITICAL", needsRescue: true, needsRelief: true, priority: 1, estimatedIntensity: "VII-VIII (Destructive to Severe)" };
    else if (distance < 60) impact = { level: "SEVERE", needsRescue: true, needsRelief: true, priority: 2, estimatedIntensity: "VI-VII (Strong to Very Strong)" };
    else if (distance < 100) impact = { level: "HIGH", needsRescue: false, needsRelief: true, priority: 3, estimatedIntensity: "V-VI (Moderate to Strong)" };
    else if (distance < 150) impact = { level: "MODERATE", needsRescue: false, needsRelief: true, priority: 4, estimatedIntensity: "IV-V (Light to Moderate)" };
  } else if (magnitude >= 5.5) {
    if (distance < 20) impact = { level: "SEVERE", needsRescue: true, needsRelief: true, priority: 2, estimatedIntensity: "VI-VII" };
    else if (distance < 50) impact = { level: "HIGH", needsRescue: false, needsRelief: true, priority: 3, estimatedIntensity: "V-VI" };
    else if (distance < 100) impact = { level: "MODERATE", needsRescue: false, needsRelief: true, priority: 4, estimatedIntensity: "IV-V" };
  } else if (magnitude >= 4.5) {
    if (distance < 15) impact = { level: "MODERATE", needsRescue: false, needsRelief: true, priority: 4, estimatedIntensity: "V-VI" };
    else if (distance < 40) impact = { level: "LOW", needsRescue: false, needsRelief: false, priority: 5, estimatedIntensity: "III-IV" };
  } else if (magnitude >= 3.5 && distance < 10) {
    impact = { level: "LOW", needsRescue: false, needsRelief: false, priority: 5, estimatedIntensity: "III-IV" };
  }

  return impact;
}

function getActionRecommendations(impact: Impact): string[] {
  const actions: string[] = [];
  switch (impact.level) {
    case "CRITICAL":
      actions.push(
        "🚨 IMMEDIATE: Deploy search & rescue teams",
        "🏥 URGENT: Send medical teams and trauma supplies",
        "🏗️ Conduct structural damage assessment",
        "📦 Distribute emergency relief (food, water, shelter)",
        "🏕️ Establish evacuation centers",
        "🩸 Mobilize blood donation drives"
      );
      break;
    case "SEVERE":
      actions.push(
        "🚨 Deploy search & rescue teams if needed",
        "🏥 Send medical assistance",
        "📦 Distribute relief goods (food, water, medicines)",
        "🏕️ Set up temporary shelters",
        "🔦 Provide emergency supplies"
      );
      break;
    case "HIGH":
      actions.push(
        "📦 Distribute relief goods",
        "🏕️ Prepare evacuation centers",
        "👥 Check on vulnerable populations",
        "🔦 Provide flashlights and batteries"
      );
      break;
    case "MODERATE":
      actions.push(
        "👥 Monitor and check on residents",
        "📱 Establish communication with local officials",
        "📦 Prepare relief goods for distribution"
      );
      break;
    case "LOW":
      actions.push("👥 Monitor situation", "📱 Stay in contact with local authorities");
      break;
  }
  return actions;
}

function parsePhilippineDate(dateString: string): Date {
  try {
    const [datePart, timePart] = dateString.split(" - ");
    const [day, month, year] = datePart.split(" ");
    const [time, period] = timePart.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    const monthMap: Record<string, string> = { January:"01",February:"02",March:"03",April:"04",May:"05",June:"06",July:"07",August:"08",September:"09",October:"10",November:"11",December:"12" };
    return new Date(`${year}-${monthMap[month]}-${String(day).padStart(2,"0")}T${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:00+08:00`);
  } catch {
    return new Date();
  }
}

// -------------------- FETCH --------------------
async function fetchFromPHIVOLCS(): Promise<Earthquake[]> {
  const axiosInstance = axios.create({ httpsAgent: new https.Agent({ rejectUnauthorized: false }), timeout: 15000, headers: { "User-Agent": "Mozilla/5.0" } });
  const response = await axiosInstance.get("https://earthquake.phivolcs.dost.gov.ph/");
  const $: CheerioAPI = cheerio.load(response.data);

  let earthquakeTable: Element | null = null;

  $("table").each((_, table) => {
    const headers = $(table).find("th").map((_, th) => $(th).text().trim()).get();
    if (headers.some(h => h.toLowerCase().includes("date")) && headers.some(h => h.toLowerCase().includes("magnitude"))) {
      earthquakeTable = table;
      return false;
    }
  });

  if (!earthquakeTable) throw new Error("Earthquake table not found on PHIVOLCS");

  const earthquakes: Earthquake[] = [];
  $(earthquakeTable).find("tr").each((_, row) => {
    const cols = $(row).find("td");
    if (cols.length >= 6) {
      const dateTime = $(cols[0]).text().trim();
      const latitude = parseFloat($(cols[1]).text().trim());
      const longitude = parseFloat($(cols[2]).text().trim());
      const depth = $(cols[3]).text().trim();
      const magnitude = parseFloat($(cols[4]).text().trim());
      const location = $(cols[5]).text().trim();

      if (location.toLowerCase().includes("cebu") || (latitude >= 9.4 && latitude <= 11.5 && longitude >= 123 && longitude <= 124.5)) {
        earthquakes.push({
          dateTime,
          parsedDate: parsePhilippineDate(dateTime).toISOString(),
          latitude,
          longitude,
          depth,
          magnitude,
          location: location.replace(/\s+/g, " ").trim(),
          source: "PHIVOLCS"
        });
      }
    }
  });

  return earthquakes;
}

async function fetchFromUSGS(): Promise<Earthquake[]> {
  const starttime = new Date(Date.now() - 7*24*60*60*1000).toISOString().split("T")[0];
  const response = await axios.get("https://earthquake.usgs.gov/fdsnws/event/1/query", {
    params: { format: "geojson", latitude: 10.5, longitude: 123.9, maxradiuskm: 200, starttime, minmagnitude: 3.0 }, timeout: 10000
  });

  return response.data.features.map((f: any) => {
    const props = f.properties, coords = f.geometry.coordinates;
    return {
      dateTime: new Date(props.time).toLocaleString("en-PH",{timeZone:"Asia/Manila"}),
      parsedDate: new Date(props.time).toISOString(),
      latitude: coords[1],
      longitude: coords[0],
      depth: `${coords[2]} km`,
      magnitude: props.mag||0,
      location: props.place||"Near Cebu",
      source:"USGS"
    };
  });
}

async function fetchEarthquakes(): Promise<Earthquake[]> {
  try { return await fetchFromPHIVOLCS(); } 
  catch { return await fetchFromUSGS(); }
}

// -------------------- ANALYSIS --------------------
function analyzeAffectedAreas(earthquakes: Earthquake[]): AffectedArea[] {
  const map = new Map<string, AffectedArea>();

  earthquakes.forEach(eq => {
    CEBU_LOCATIONS.forEach(loc => {
      const distance = calculateDistance(eq.latitude, eq.longitude, loc.lat, loc.lon);
      const impact = calculateImpact(eq.magnitude, distance);
      if (impact.level !== "MINIMAL") {
        const existing = map.get(loc.name);
        if (!existing || impact.priority < existing.priority) {
          map.set(loc.name, {
            location: loc.name,
            population: loc.population,
            coordinates: { lat: loc.lat, lon: loc.lon },
            distance: distance.toFixed(1),
            impactLevel: impact.level,
            estimatedIntensity: impact.estimatedIntensity,
            needsRescue: impact.needsRescue,
            needsRelief: impact.needsRelief,
            priority: impact.priority,
            recommendations: getActionRecommendations(impact),
            causingEarthquake: { magnitude: eq.magnitude, location: eq.location, dateTime: eq.dateTime, depth: eq.depth }
          });
        }
      }
    });
  });

  return Array.from(map.values()).sort((a,b)=>a.priority-b.priority);
}

// -------------------- ROUTES --------------------
router.get("/relief-distribution", async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cachedData && now - lastFetch < CACHE_DURATION) {
      return res.json({ ...cachedData, cached: true, cacheAge: `${Math.floor((now-lastFetch)/1000)}s ago` });
    }

    const earthquakes = await fetchEarthquakes();
    if (!earthquakes.length) {
      cachedData = {
        success:true,
        status:"NO RECENT EARTHQUAKES",
        message:"No significant seismic activity detected in Cebu region",
        affectedAreas:[],
        earthquakes:[],
        timestamp:new Date().toISOString(),
        nextUpdate:new Date(now+CACHE_DURATION).toISOString()
      };
      lastFetch = now;
      return res.json(cachedData);
    }

    earthquakes.sort((a,b) => new Date(b.parsedDate).getTime() - new Date(a.parsedDate).getTime() || b.magnitude - a.magnitude);
    const affectedAreas = analyzeAffectedAreas(earthquakes);

    const criticalAreas = affectedAreas.filter(a=>a.impactLevel==="CRITICAL");
    const severeAreas = affectedAreas.filter(a=>a.impactLevel==="SEVERE");
    const highAreas = affectedAreas.filter(a=>a.impactLevel==="HIGH");
    const totalAffectedPopulation = affectedAreas.filter(a=>a.needsRelief).reduce((sum,a)=>sum+a.population,0);

    const response = {
      success:true,
      status: criticalAreas.length>0 ? "🚨 EMERGENCY" : severeAreas.length>0 ? "⚠️ URGENT" : "ℹ️ MONITOR",
      summary: {
        totalEarthquakes: earthquakes.length,
        affectedLocations: affectedAreas.length,
        criticalAreas: criticalAreas.length,
        severeAreas: severeAreas.length,
        highPriorityAreas: highAreas.length,
        locationsNeedingRescue: affectedAreas.filter(a=>a.needsRescue).length,
        locationsNeedingRelief: affectedAreas.filter(a=>a.needsRelief).length,
        estimatedAffectedPopulation: totalAffectedPopulation
      },
      deploymentPriority: { critical: criticalAreas, severe: severeAreas, high: highAreas },
      affectedAreas: affectedAreas.slice(0,30),
      recentEarthquakes: earthquakes.slice(0,10).map(eq=>({ magnitude:eq.magnitude, location:eq.location, dateTime:eq.dateTime, depth:eq.depth, source:eq.source })),
      dataSource: earthquakes[0]?.source || "Unknown",
      timestamp: new Date().toISOString(),
      nextUpdate: new Date(now+CACHE_DURATION).toISOString(),
      dataFreshness: "Live from PHIVOLCS/USGS",
    };

    cachedData = response;
    lastFetch = now;
    res.json(response);

  } catch (err: any) {
    res.status(500).json({ success:false, error:"Failed to fetch real-time earthquake data", details:err.message, timestamp:new Date().toISOString() });
  }
});

router.get("/health", (req: Request, res: Response) => {
  res.json({
    status:"operational",
    mode:"REAL-TIME DYNAMIC",
    dataSources:{primary:"PHIVOLCS", backup:"USGS"},
    cacheStatus:{
      active: cachedData!==null,
      ageSeconds: cachedData?Math.floor((Date.now()-lastFetch)/1000):0,
      expiresIn: cachedData?Math.max(0, Math.floor((CACHE_DURATION-(Date.now()-lastFetch))/1000)):0
    },
    coverage:`${CEBU_LOCATIONS.length} locations in Cebu`,
    timestamp:new Date().toISOString()
  });
});

router.post("/cache/clear", (req: Request, res: Response) => {
  cachedData=null;
  lastFetch=0;
  res.json({ success:true, message:"Cache cleared successfully", timestamp:new Date().toISOString() });
});

export default router;
