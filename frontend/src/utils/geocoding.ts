const placeNameCache = new Map<string, string>();
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT_DURATION = 30000; // 30 seconds

// Helper function for retry logic
async function retryFetch<T>(fn: () => Promise<T>, attempts: number): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts > 1) {
      console.warn(`Fetch attempt failed, retrying in ${RETRY_DELAY}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryFetch(fn, attempts - 1);
    }
    throw error;
  }
}

// Helper function to create fetch with proper headers and timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'CalamityResponseApp/1.0',
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle abort errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${TIMEOUT_DURATION / 1000} seconds. The geocoding service may be slow or unavailable.`);
    }
    
    throw error;
  }
}

export const getPlaceName = async (lat: number, lon: number): Promise<string> => {
  const cacheKey = `${lat.toFixed(4)}:${lon.toFixed(4)}`;
  
  if (placeNameCache.has(cacheKey)) {
    return placeNameCache.get(cacheKey)!;
  }

  const fetchPlaceName = async (): Promise<string> => {
    // Check if we're in development mode (proxy available) or production
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev 
      ? '/api/nominatim' // Use proxy in development
      : 'https://nominatim.openstreetmap.org'; // Direct URL in production
    
    const url = `${baseUrl}/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
    
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from Nominatim API');
    }
    
    // Extract meaningful location name
    const name = extractMeaningfulName(data) || 'Unknown location';
    placeNameCache.set(cacheKey, name);
    return name;
  };

  try {
    // Add initial delay to respect Nominatim's usage policy
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const placeName = await retryFetch(fetchPlaceName, RETRY_ATTEMPTS);
    return placeName;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Check if it's a timeout error and provide more specific feedback
    if (error instanceof Error && error.message.includes('timed out')) {
      console.warn(`Geocoding request timed out for coordinates: ${lat}, ${lon}`);
    }
    
    // Provide fallback location data
    const fallbackName = `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    placeNameCache.set(cacheKey, fallbackName);
    return fallbackName;
  }
};

// Helper function to extract the most meaningful location name
function extractMeaningfulName(data: any): string | null {
  if (!data) return null;
  
  // Priority order for location names
  const addressHierarchy = [
    data.address?.house_number,
    data.address?.road,
    data.address?.suburb,
    data.address?.city_district,
    data.address?.town,
    data.address?.city,
    data.address?.county,
    data.address?.state,
    data.address?.country,
  ].filter(Boolean);
  
  if (addressHierarchy.length > 0) {
    // Take the first 3 meaningful parts
    return addressHierarchy.slice(0, 3).join(', ');
  }
  
  // Fallback to display_name if available
  return data.display_name || null;
}