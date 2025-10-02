const placeNameCache = new Map<string, string>();

export const getPlaceName = async (lat: number, lon: number): Promise<string> => {
  const cacheKey = `${lat.toFixed(4)}:${lon.toFixed(4)}`;
  
  if (placeNameCache.has(cacheKey)) {
    return placeNameCache.get(cacheKey)!;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      { headers: { 'User-Agent': 'EmergencyReliefApp/1.0' } }
    );
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data = await response.json();
    const name: string = data.display_name || 'Unknown location';
    placeNameCache.set(cacheKey, name);
    return name;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unknown location';
  }
};