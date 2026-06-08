import { Package, Droplet, Heart, Home, Users } from "lucide-react";
import type { AffectedArea, NeedOption, UrgencyColor } from "../types";

export const API_URL: string =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const GENERAL_SANTOS_CENTER: [number, number] = [6.1164, 125.1716];
export const GENERAL_SANTOS_BOUNDS: [[number, number], [number, number]] = [
  [5.5, 124.5],
  [7.0, 126.0],
];

// Legacy Cebu references (kept for backward compatibility)
export const CEBU_CENTER: [number, number] = [11.0462, 124.0029];
export const CEBU_BOUNDS: [[number, number], [number, number]] = [
  [8.5, 122.5],
  [12.5, 125.5],
];

export const DAVAO_ORIENTAL_CENTER: [number, number] = [6.9175, 126.2227];
export const DAVAO_ORIENTAL_BOUNDS: [[number, number], [number, number]] = [
  [5.5, 125.0],
  [7.5, 127.0],
];

export const needOptions: NeedOption[] = [
  { value: "food", label: "Food", icon: <Package className="w-5 h-5" /> },
  { value: "water", label: "Water", icon: <Droplet className="w-5 h-5" /> },
  { value: "medical", label: "Medical", icon: <Heart className="w-5 h-5" /> },
  { value: "shelter", label: "Shelter", icon: <Home className="w-5 h-5" /> },
  { value: "clothing", label: "Clothing", icon: <Users className="w-5 h-5" /> },
  { value: "other", label: "Other", icon: <Package className="w-5 h-5" /> },
];

export const urgencyColors: Record<"low" | "medium" | "high" | "critical", UrgencyColor> = {
  low: { bg: "#10b981", text: "Low", light: "#d1fae5", dark: "#047857" },
  medium: { bg: "#f59e0b", text: "Medium", light: "#fef3c7", dark: "#b45309" },
  high: { bg: "#f97316", text: "High", light: "#ffedd5", dark: "#c2410c" },
  critical: { bg: "#ef4444", text: "Critical", light: "#fee2e2", dark: "#b91c1c" },
};
export const affectedAreas: AffectedArea[] = [
  {
    name: "Bogo City",
    coords: [11.0517, 124.0055],
    intensity: "VII (Destructive)",
  },
  {
    name: "San Remigio",
    coords: [11.0809, 123.9381],
    intensity: "VI (Very Strong)",
  },
  { name: "Medellin", coords: [11.1286, 123.962], intensity: "V (Strong)" },
  {
    name: "Tabogon",
    coords: [10.9433, 124.0278],
    intensity: "IV (Moderately Strong)",
  },
  {
    name: "Tabuelan",
    coords: [10.8217, 123.8717],
    intensity: "IV (Moderately Strong)",
  },
  { name: "Sogod", coords: [10.7508, 123.9996], intensity: "III (Weak)" },
];
