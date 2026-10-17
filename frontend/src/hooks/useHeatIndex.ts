import { useCallback, useEffect, useState } from "react";
import { CEBU_CENTER } from "../constants";

export type HeatLevel = "normal" | "caution" | "extreme_caution" | "danger" | "extreme_danger";

export interface HeatReading {
  heatIndexC: number;
  temperatureC: number;
  humidity: number;
  level: HeatLevel;
  fetchedAt: Date;
}

// NWS Rothfusz regression; inputs in °C and %RH, output in °C.
export const computeHeatIndex = (tempC: number, rh: number): number => {
  const t = tempC * 9 / 5 + 32;
  const simple = 0.5 * (t + 61 + (t - 68) * 1.2 + rh * 0.094);
  let hi = simple;

  if ((simple + t) / 2 >= 80) {
    hi =
      -42.379 + 2.04901523 * t + 10.14333127 * rh - 0.22475541 * t * rh -
      0.00683783 * t * t - 0.05481717 * rh * rh + 0.00122874 * t * t * rh +
      0.00085282 * t * rh * rh - 0.00000199 * t * t * rh * rh;
    if (rh < 13 && t >= 80 && t <= 112) {
      hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
    } else if (rh > 85 && t >= 80 && t <= 87) {
      hi += ((rh - 85) / 10) * ((87 - t) / 5);
    }
  }

  return ((hi - 32) * 5) / 9;
};

// PAGASA heat index classification
export const classifyHeat = (hiC: number): HeatLevel => {
  if (hiC >= 52) return "extreme_danger";
  if (hiC >= 42) return "danger";
  if (hiC >= 33) return "extreme_caution";
  if (hiC >= 27) return "caution";
  return "normal";
};

// Uses the device location only if permission was already granted; never prompts on load.
const resolveCoords = async (): Promise<[number, number]> => {
  try {
    if (!navigator.geolocation || !navigator.permissions) return CEBU_CENTER;
    const status = await navigator.permissions.query({ name: "geolocation" });
    if (status.state !== "granted") return CEBU_CENTER;
    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
        () => resolve(CEBU_CENTER),
        { timeout: 5000, maximumAge: 10 * 60 * 1000 }
      );
    });
  } catch {
    return CEBU_CENTER;
  }
};

export const useHeatIndex = () => {
  const [reading, setReading] = useState<HeatReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const [lat, lon] = await resolveCoords();
      const params = new URLSearchParams({
        latitude: lat.toFixed(3),
        longitude: lon.toFixed(3),
        current: "temperature_2m,relative_humidity_2m",
        timezone: "Asia/Manila",
      });
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
      if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
      const data = await res.json();
      const temperatureC: number = data.current.temperature_2m;
      const humidity: number = data.current.relative_humidity_2m;
      const heatIndexC = computeHeatIndex(temperatureC, humidity);
      if (signal?.aborted) return;
      setReading({
        heatIndexC,
        temperatureC,
        humidity,
        level: classifyHeat(heatIndexC),
        fetchedAt: new Date(),
      });
    } catch (err) {
      if (signal?.aborted) return;
      console.error("Failed to load heat index:", err);
      setError("heat");
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { reading, isLoading, error, reload: () => void load() };
};
