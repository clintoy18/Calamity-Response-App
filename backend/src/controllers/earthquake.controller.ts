// src/controllers/earthquakeController.ts
import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

export interface EarthquakeData {
  dateTime: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  location: string;
  municipality?: string;
  province?: string;
  distance?: string;
  direction?: string;
  parsedDate?: Date;
  isAftershock?: boolean;
  mainshockId?: number;
}

export interface MunicipalityWithCoords {
  name: string;
  latitude: number;
  longitude: number;
}

export interface ProvinceCount {
  province: string;
  count: number;
  mainshockCount: number;
  aftershockCount: number;
  municipalities: MunicipalityWithCoords[];
  latitude?: number;
  longitude?: number;
  region?: string;
}

export interface RegionalData {
  region: string;
  totalEarthquakes: number;
  totalMainshocks: number;
  totalAftershocks: number;
  provinces: ProvinceCount[];
  latitude: number;
  longitude: number;
}

const httpsAgent = new https.Agent({ 
  rejectUnauthorized: false,
  keepAlive: true,
  maxSockets: 50,
  timeout: 10000
});

// Persistent cache
const coordinatesCache = new Map<string, { lat: number; lon: number }>();

// Province to Region mapping
const PROVINCE_TO_REGION: Record<string, string> = {
  // Luzon
  "Abra": "Luzon",
  "Agusan Del Norte": "Mindanao",
  "Agusan Del Sur": "Mindanao",
  "Aklan": "Visayas",
  "Albay": "Luzon",
  "Antique": "Visayas",
  "Apayao": "Luzon",
  "Aurora": "Luzon",
  "Basilan": "Mindanao",
  "Bataan": "Luzon",
  "Batanes": "Luzon",
  "Batangas": "Luzon",
  "Benguet": "Luzon",
  "Biliran": "Visayas",
  "Bohol": "Visayas",
  "Bukidnon": "Mindanao",
  "Bulacan": "Luzon",
  "Cagayan": "Luzon",
  "Camarines Norte": "Luzon",
  "Camarines Sur": "Luzon",
  "Camiguin": "Mindanao",
  "Capiz": "Visayas",
  "Catanduanes": "Luzon",
  "Cavite": "Luzon",
  "Cebu": "Visayas",
  "Cotabato": "Mindanao",
  "Davao De Oro": "Mindanao",
  "Davao Del Norte": "Mindanao",
  "Davao Del Sur": "Mindanao",
  "Davao Occidental": "Mindanao",
  "Davao Oriental": "Mindanao",
  "Dinagat Islands": "Mindanao",
  "Eastern Samar": "Visayas",
  "Guimaras": "Visayas",
  "Ifugao": "Luzon",
  "Ilocos Norte": "Luzon",
  "Ilocos Sur": "Luzon",
  "Iloilo": "Visayas",
  "Isabela": "Luzon",
  "Kalinga": "Luzon",
  "La Union": "Luzon",
  "Laguna": "Luzon",
  "Lanao Del Norte": "Mindanao",
  "Lanao Del Sur": "Mindanao",
  "Leyte": "Visayas",
  "Maguindanao": "Mindanao",
  "Maguindanao Del Norte": "Mindanao",
  "Maguindanao Del Sur": "Mindanao",
  "Marinduque": "Luzon",
  "Masbate": "Luzon",
  "Metro Manila": "Luzon",
  "Misamis Occidental": "Mindanao",
  "Misamis Oriental": "Mindanao",
  "Mountain Province": "Luzon",
  "Negros Occidental": "Visayas",
  "Negros Oriental": "Visayas",
  "Northern Samar": "Visayas",
  "Nueva Ecija": "Luzon",
  "Nueva Vizcaya": "Luzon",
  "Occidental Mindoro": "Luzon",
  "Oriental Mindoro": "Luzon",
  "Palawan": "Luzon",
  "Pampanga": "Luzon",
  "Pangasinan": "Luzon",
  "Quezon": "Luzon",
  "Quirino": "Luzon",
  "Rizal": "Luzon",
  "Romblon": "Luzon",
  "Samar": "Visayas",
  "Sarangani": "Mindanao",
  "Siquijor": "Visayas",
  "Sorsogon": "Luzon",
  "South Cotabato": "Mindanao",
  "Southern Leyte": "Visayas",
  "Sultan Kudarat": "Mindanao",
  "Sulu": "Mindanao",
  "Surigao Del Norte": "Mindanao",
  "Surigao Del Sur": "Mindanao",
  "Tarlac": "Luzon",
  "Tawi-Tawi": "Mindanao",
  "Zambales": "Luzon",
  "Zamboanga Del Norte": "Mindanao",
  "Zamboanga Del Sur": "Mindanao",
  "Zamboanga Sibugay": "Mindanao"
};

// Enhanced province coordinates
const PROVINCE_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "Cebu": { lat: 10.3157, lon: 123.8854 },
  "Davao Oriental": { lat: 6.9202, lon: 126.2549 },
  "Surigao Del Sur": { lat: 8.5400, lon: 126.0000 },
  "Batangas": { lat: 13.8345, lon: 121.0524 },
  "Occidental Mindoro": { lat: 12.8333, lon: 120.9167 },
  "Surigao Del Norte": { lat: 9.8000, lon: 125.5000 },
  "Negros Occidental": { lat: 10.5000, lon: 123.0000 },
  "Ilocos Norte": { lat: 18.1667, lon: 120.7500 },
  "Leyte": { lat: 10.8333, lon: 124.8333 },
  "Batanes": { lat: 20.4167, lon: 121.9667 },
  "Aurora": { lat: 15.9833, lon: 121.5333 },
  "Cagayan": { lat: 17.9667, lon: 121.6000 },
  "Zambales": { lat: 15.5000, lon: 120.0000 },
  "Davao Occidental": { lat: 6.5000, lon: 125.5000 },
  "Pangasinan": { lat: 15.9167, lon: 120.3333 },
  "Ilocos Sur": { lat: 17.3333, lon: 120.5000 },
  "Agusan Del Norte": { lat: 9.1667, lon: 125.5000 },
  "Davao De Oro": { lat: 7.5231, lon: 126.0000 },
  "Eastern Samar": { lat: 11.5000, lon: 125.5000 },
  "Negros Oriental": { lat: 9.7500, lon: 123.0000 },
  "Isabela": { lat: 17.0000, lon: 122.0000 },
  "Camarines Sur": { lat: 13.6667, lon: 123.3333 },
  "Agusan Del Sur": { lat: 8.5000, lon: 125.8333 },
  "Masbate": { lat: 12.1667, lon: 123.5833 },
  "Davao Del Norte": { lat: 7.3500, lon: 125.7000 },
  "Northern Samar": { lat: 12.3333, lon: 124.6667 },
  "Oriental Mindoro": { lat: 13.0000, lon: 121.0833 },
  "Abra": { lat: 17.5833, lon: 120.7500 },
  "Zamboanga Del Norte": { lat: 8.0000, lon: 123.0000 },
  "Cotabato": { lat: 7.2000, lon: 124.8500 },
  "Tarlac": { lat: 15.5000, lon: 120.5000 },
  "Benguet": { lat: 16.4167, lon: 120.6167 },
  "Bohol": { lat: 9.8333, lon: 124.1667 },
  "Iloilo": { lat: 11.0000, lon: 122.6667 },
  "Davao Del Sur": { lat: 6.4167, lon: 125.3333 },
  "Lanao Del Sur": { lat: 7.9167, lon: 124.2500 },
  "Zamboanga Del Sur": { lat: 7.8333, lon: 123.4167 },
  "La Union": { lat: 16.5000, lon: 120.3333 },
  "Bataan": { lat: 14.6667, lon: 120.4167 },
  "Quezon": { lat: 14.0000, lon: 121.5000 },
  "Sultan Kudarat": { lat: 6.5500, lon: 124.2833 },
  "Dinagat Islands": { lat: 10.1667, lon: 125.5833 },
  "Marinduque": { lat: 13.4167, lon: 121.9167 },
  "Southern Leyte": { lat: 10.3333, lon: 125.0833 },
  "South Cotabato": { lat: 6.1667, lon: 124.8333 },
  "Sarangani": { lat: 5.8667, lon: 125.2833 },
  "Sorsogon": { lat: 12.8333, lon: 123.9167 },
  "Antique": { lat: 11.1667, lon: 122.0833 },
  "Samar": { lat: 11.8333, lon: 125.0000 },
  "Catanduanes": { lat: 13.8333, lon: 124.2500 },
  "Aklan": { lat: 11.6667, lon: 122.3333 },
  "Maguindanao Del Sur": { lat: 6.8333, lon: 124.5000 },
  "Siquijor": { lat: 9.2000, lon: 123.5000 },
  "Ifugao": { lat: 16.8333, lon: 121.1667 },
  "Bukidnon": { lat: 8.0833, lon: 125.0833 },
  "Nueva Ecija": { lat: 15.5833, lon: 121.0000 },
  "Calayan": { lat: 19.2613, lon: 121.4756 },
  "Municipality Of Sarangani": { lat: 5.4067, lon: 125.4583 },
  "Vinzons": { lat: 14.1740, lon: 122.9076 },
  "Aparri": { lat: 18.3561, lon: 121.6400 }
};

// Comprehensive municipality coordinates
const MUNICIPALITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "Bantayan": { lat: 11.1683, lon: 123.7222 },
  "City of Bogo": { lat: 11.0517, lon: 124.0053 },
  "City Of Bogo": { lat: 11.0517, lon: 124.0053 },
  "Daanbantayan": { lat: 11.2500, lon: 124.0000 },
  "Medellin": { lat: 11.1286, lon: 123.9619 },
  "San Remigio": { lat: 11.0833, lon: 123.9500 },
  "Sogod": { lat: 10.7500, lon: 124.0167 },
  "Tabogon": { lat: 10.9333, lon: 124.0333 },
  "Baganga": { lat: 7.5739, lon: 126.5603 },
  "Boston": { lat: 7.8711, lon: 126.3753 },
  "Caraga": { lat: 7.3294, lon: 126.5678 },
  "Cateel": { lat: 7.7914, lon: 126.4533 },
  "Governor Generoso": { lat: 6.6564, lon: 126.0722 },
  "Manay": { lat: 7.2097, lon: 126.5397 },
  "San Isidro": { lat: 6.8375, lon: 126.0892 },
  "Tarragona": { lat: 7.0492, lon: 126.4489 },
  "Bayabas": { lat: 8.9674, lon: 126.2828 },
  "Cagwait": { lat: 8.7167, lon: 126.3833 },
  "Carrascal": { lat: 9.3833, lon: 125.9500 },
  "City Of Bislig": { lat: 8.2128, lon: 126.3233 },
  "City Of Tandag": { lat: 9.0750, lon: 126.1989 },
  "Cortes": { lat: 9.1667, lon: 125.9667 },
  "Hinatuan": { lat: 8.3656, lon: 126.3358 },
  "Lianga": { lat: 8.6333, lon: 126.1000 },
  "Lingig": { lat: 8.0383, lon: 126.4123 },
  "Marihatag": { lat: 8.9000, lon: 126.3500 },
  "Batangas City": { lat: 13.7565, lon: 121.0583 },
  "Calatagan": { lat: 13.8317, lon: 120.6322 },
  "Lian": { lat: 14.0353, lon: 120.6497 },
  "Nasugbu": { lat: 14.0686, lon: 120.6311 },
  "Tingloy": { lat: 13.6606, lon: 120.8817 },
  "Abra De Ilog": { lat: 13.4500, lon: 120.7333 },
  "Looc": { lat: 13.8000, lon: 121.2167 },
  "Lubang": { lat: 13.8625, lon: 120.1233 },
  "Mamburao": { lat: 13.2217, lon: 120.5950 },
  "Paluan": { lat: 13.4167, lon: 120.4667 },
  "Rizal": { lat: 12.4833, lon: 121.3833 },
  "San Jose": { lat: 12.3500, lon: 121.0667 },
  "Santa Cruz": { lat: 13.3683, lon: 121.4161 },
  "Burgos": { lat: 9.8833, lon: 125.9833 },
  "Claver": { lat: 9.5333, lon: 125.7167 },
  "Del Carmen": { lat: 9.8833, lon: 125.9667 },
  "General Luna": { lat: 9.7833, lon: 126.1500 },
  "Malimono": { lat: 9.5833, lon: 125.5167 },
  "Pilar": { lat: 9.8167, lon: 125.9500 },
  "Sison": { lat: 9.6667, lon: 125.6167 },
  "Socorro": { lat: 9.6167, lon: 125.9833 },
  "Tubod": { lat: 9.5667, lon: 125.5333 },
  "Balut Island": { lat: 5.4131, lon: 125.4753 },
  "Sarangani Island": { lat: 5.4833, lon: 125.3500 },
  "Babuyan Island": { lat: 19.5167, lon: 121.9333 },
  "Camiguin Island": { lat: 18.9000, lon: 121.3167 },
  "Dalupiri Island": { lat: 19.0167, lon: 121.3167 },
  "Fuga Island": { lat: 18.5167, lon: 121.2333 },
  "Tinaga Island": { lat: 14.1740, lon: 122.9076 }
};

const normalizeName = (name: string): string => {
  return name.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

const parseDateTime = (dateTimeStr: string): Date | null => {
  try {
    const monthMap: Record<string, string> = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };

    const match = dateTimeStr.match(/(\d+)\s+(\w+)\s+(\d+)\s+-\s+(\d+):(\d+)\s+(AM|PM)/i);
    if (!match) return null;

    const [, day, month, year, hour, minute, period] = match;
    const monthNum = monthMap[month];
    if (!monthNum) return null;

    let hours = parseInt(hour);
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    else if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

    const dateStr = `${year}-${monthNum}-${day.padStart(2,'0')}T${hours.toString().padStart(2,'0')}:${minute.padStart(2,'0')}:00+08:00`;
    return new Date(dateStr);
  } catch {
    return null;
  }
};

const extractMunicipality = (location: string): string | null => {
  const match = location.match(/of\s+([^(]+)/);
  if (match) return match[1].trim();

  const directMatch = location.match(/^([^(]+)/);
  if (directMatch) {
    const city = directMatch[1].trim();
    if (!/^\d/.test(city)) return city;
  }

  return null;
};

const extractProvince = (location: string): string | null => {
  const match = location.match(/\(([^)]+)\)/);
  return match ? match[1].trim() : null;
};

const getRegion = (province: string): string => {
  return PROVINCE_TO_REGION[province] || "Unknown";
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Identify aftershocks based on proximity and time
const identifyAftershocks = (earthquakes: EarthquakeData[]): EarthquakeData[] => {
  const sorted = earthquakes
    .filter(eq => eq.parsedDate)
    .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());

  const DISTANCE_THRESHOLD = 100;
  const TIME_WINDOW = 30 * 24 * 60 * 60 * 1000;
  const MIN_MAINSHOCK_MAGNITUDE = 4.5;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    
    for (let j = i - 1; j >= 0; j--) {
      const potential = sorted[j];
      
      if (potential.magnitude < MIN_MAINSHOCK_MAGNITUDE) continue;
      if (potential.isAftershock) continue;
      
      const distance = calculateDistance(
        current.latitude, 
        current.longitude,
        potential.latitude,
        potential.longitude
      );
      
      const timeDiff = current.parsedDate!.getTime() - potential.parsedDate!.getTime();
      
      if (distance <= DISTANCE_THRESHOLD && 
          timeDiff > 0 && 
          timeDiff <= TIME_WINDOW &&
          current.magnitude <= potential.magnitude) {
        current.isAftershock = true;
        current.mainshockId = j;
        break;
      }
    }
  }

  return sorted;
};

const scrapeEarthquakes = async (filterByDate: boolean = false): Promise<EarthquakeData[]> => {
  const url = "https://earthquake.phivolcs.dost.gov.ph/";
  
  const { data: html } = await axios.get(url, {
    timeout: 10000,
    headers: { 
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Cache-Control": "no-cache"
    },
    httpsAgent,
  });

  if (!html || typeof html !== 'string') throw new Error("Invalid HTML response");

  const $ = cheerio.load(html);
  const earthquakes: EarthquakeData[] = [];
  const table = $("table:contains('Date')").first();

  if (table.length === 0) throw new Error("Earthquake table not found");

  const cutoffDate = new Date('2025-09-30T21:59:00+08:00');

  table.find("tr").each(function() {
    const cells = $(this).find("td");
    if (cells.length < 6) return;

    const dateTimeText = $(cells[0]).text().trim();
    const latitude = parseFloat($(cells[1]).text().trim());
    const longitude = parseFloat($(cells[2]).text().trim());
    const depth = parseFloat($(cells[3]).text().trim());
    const magnitude = parseFloat($(cells[4]).text().trim());
    const locationText = $(cells[5]).text().trim();

    if (!isNaN(latitude) && !isNaN(longitude)) {
      const parsedDate = parseDateTime(dateTimeText);

      if (filterByDate && parsedDate && parsedDate < cutoffDate) return;

      earthquakes.push({
        dateTime: dateTimeText,
        latitude,
        longitude,
        depth: isNaN(depth) ? 0 : depth,
        magnitude: isNaN(magnitude) ? 0 : magnitude,
        location: locationText,
        municipality: extractMunicipality(locationText) || "Unknown",
        province: extractProvince(locationText) || "Unknown",
        parsedDate: parsedDate || undefined,
        isAftershock: false
      });
    }
  });

  if (earthquakes.length === 0) throw new Error("No earthquake data found");

  return earthquakes;
};

const getCoordinatesSync = (place: string, province: string = '', type: 'province' | 'municipality' = 'municipality'): { lat: number; lon: number } => {
  const normalizedPlace = normalizeName(place);
  const cacheKey = `${type}:${normalizedPlace}`;
  
  if (coordinatesCache.has(cacheKey)) {
    return coordinatesCache.get(cacheKey)!;
  }

  if (type === 'province' && PROVINCE_COORDINATES[place]) {
    coordinatesCache.set(cacheKey, PROVINCE_COORDINATES[place]);
    return PROVINCE_COORDINATES[place];
  }

  if (type === 'municipality' && MUNICIPALITY_COORDINATES[place]) {
    coordinatesCache.set(cacheKey, MUNICIPALITY_COORDINATES[place]);
    return MUNICIPALITY_COORDINATES[place];
  }

  const coordsMap = type === 'province' ? PROVINCE_COORDINATES : MUNICIPALITY_COORDINATES;
  for (const [key, coords] of Object.entries(coordsMap)) {
    if (normalizeName(key) === normalizedPlace) {
      coordinatesCache.set(cacheKey, coords);
      return coords;
    }
  }

  if (type === 'municipality' && province && PROVINCE_COORDINATES[province]) {
    const provinceCoords = PROVINCE_COORDINATES[province];
    coordinatesCache.set(cacheKey, provinceCoords);
    return provinceCoords;
  }

  const fallback = { lat: 12.8797, lon: 121.7740 };
  coordinatesCache.set(cacheKey, fallback);
  return fallback;
};

export const getMostAffectedProvinces = async (_req: Request, res: Response) => {
  try {
    console.time('Total Processing Time');
    
    console.time('Scraping');
    const rawEarthquakes = await scrapeEarthquakes(true);
    console.timeEnd('Scraping');
    console.log(`Found ${rawEarthquakes.length} earthquakes in live table`);

    console.time('Aftershock Identification');
    const earthquakes = identifyAftershocks(rawEarthquakes);
    const totalAftershocks = earthquakes.filter(eq => eq.isAftershock).length;
    const totalMainshocks = earthquakes.length - totalAftershocks;
    console.timeEnd('Aftershock Identification');

    console.time('Data Processing');
    const provinceData: Record<string, { 
      count: number;
      mainshockCount: number;
      aftershockCount: number;
      municipalities: Map<string, string>;
    }> = {};

    earthquakes.forEach(eq => {
      const province = eq.province || "Unknown";
      const municipality = eq.municipality || "Unknown";
      const normalizedMunicipality = normalizeName(municipality);
      
      if (!provinceData[province]) {
        provinceData[province] = { 
          count: 0,
          mainshockCount: 0,
          aftershockCount: 0,
          municipalities: new Map()
        };
      }
      
      provinceData[province].count++;
      
      if (eq.isAftershock) {
        provinceData[province].aftershockCount++;
      } else {
        provinceData[province].mainshockCount++;
      }
      
      if (!provinceData[province].municipalities.has(normalizedMunicipality)) {
        provinceData[province].municipalities.set(normalizedMunicipality, municipality);
      }
    });
    console.timeEnd('Data Processing');

    console.time('Coordinate Lookup');
    const allProvinces: ProvinceCount[] = Object.entries(provinceData)
      .map(([province, data]) => {
        const provinceCoords = getCoordinatesSync(province, '', 'province');
        const region = getRegion(province);

        const municipalitiesWithCoords: MunicipalityWithCoords[] = 
          Array.from(data.municipalities.values())
            .map(municipality => {
              const coords = getCoordinatesSync(municipality, province, 'municipality');
              return {
                name: municipality,
                latitude: coords.lat,
                longitude: coords.lon
              };
            })
            .sort((a, b) => a.name.localeCompare(b.name));

        return {
          province,
          count: data.count,
          mainshockCount: data.mainshockCount,
          aftershockCount: data.aftershockCount,
          municipalities: municipalitiesWithCoords,
          latitude: provinceCoords.lat,
          longitude: provinceCoords.lon,
          region
        };
      })
      .sort((a, b) => b.count - a.count);
    
    console.timeEnd('Coordinate Lookup');

    // Group by region
    const regionalData: Record<string, RegionalData> = {
      "Luzon": { 
        region: "Luzon", 
        totalEarthquakes: 0, 
        totalMainshocks: 0, 
        totalAftershocks: 0, 
        provinces: [],
        latitude: 15.5,
        longitude: 120.9833
      },
      "Visayas": { 
        region: "Visayas", 
        totalEarthquakes: 0, 
        totalMainshocks: 0, 
        totalAftershocks: 0, 
        provinces: [],
        latitude: 11.0,
        longitude: 123.5
      },
      "Mindanao": { 
        region: "Mindanao", 
        totalEarthquakes: 0, 
        totalMainshocks: 0, 
        totalAftershocks: 0, 
        provinces: [],
        latitude: 7.5,
        longitude: 125.0
      }
    };

    allProvinces.forEach(province => {
      const region = province.region || "Unknown";
      if (regionalData[region]) {
        regionalData[region].provinces.push(province);
        regionalData[region].totalEarthquakes += province.count;
        regionalData[region].totalMainshocks += province.mainshockCount;
        regionalData[region].totalAftershocks += province.aftershockCount;
      }
    });

    // Sort provinces within each region by earthquake count
    Object.values(regionalData).forEach(region => {
      region.provinces.sort((a, b) => b.count - a.count);
    });

    // Convert to array and sort by total earthquakes
    const sortedRegionalData = Object.values(regionalData)
      .filter(region => region.totalEarthquakes > 0)
      .sort((a, b) => b.totalEarthquakes - a.totalEarthquakes);

    console.timeEnd('Total Processing Time');

    const dates = earthquakes
      .filter(eq => eq.parsedDate)
      .map(eq => eq.parsedDate!.getTime());
    
    const earliestDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
    const latestDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
    
    const dateRangeStr = earliestDate && latestDate
      ? `${earliestDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })} - ${latestDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`
      : "Date range unavailable";

    res.status(200).json({
      success: true,
      dateRange: dateRangeStr,
      CRITICAL_WARNING: {
        issue: "INCOMPLETE DATA - Missing September 30 earthquake",
        explanation: "PHIVOLCS live table only shows ~200 most recent earthquakes. Historical data from Sept 30 (including the M6.9 Cebu earthquake that killed 75 people) is NO LONGER in the table.",
        missingEvents: [
          "Sept 30, 2025 9:59 PM - M6.9 Cebu earthquake (75 deaths, 10,000+ aftershocks)",
          "Oct 10, 2025 9:43 AM - M7.4 Davao Oriental earthquake"
        ],
        solutions: [
          "Use PHIVOLCS API if available",
          "Contact PHIVOLCS directly for historical database export",
          "Scrape archived individual bulletin pages from /2025_Earthquake_Information/",
          "Use USGS earthquake catalog as alternative data source",
          "Store daily snapshots of the live table to build your own historical database"
        ],
        recommendation: "This data should NOT be used for reports or analysis requiring complete historical records since Sept 30, 2025"
      },
      summary: {
        totalEarthquakes: earthquakes.length,
        totalMainshocks,
        totalAftershocks,
        totalProvinces: allProvinces.length,
        totalRegions: sortedRegionalData.length
      },
      byRegion: sortedRegionalData,
      allProvinces: allProvinces
    });

  } catch (err: any) {
    console.error("Error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to calculate most affected provinces",
      details: err.message
    });
  }
};