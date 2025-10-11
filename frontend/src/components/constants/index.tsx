// constants.ts
import { Utensils, Droplet, BriefcaseMedical, Home, Shirt, LifeBuoy } from "lucide-react";

export const needOptions = [
  { label: "Food", value: "food", icon: <Utensils className="w-5 h-5" /> },
  { label: "Water", value: "water", icon: <Droplet className="w-5 h-5" /> },
  { label: "Medical", value: "medical", icon: <BriefcaseMedical className="w-5 h-5" /> },
  { label: "Shelter", value: "shelter", icon: <Home className="w-5 h-5" /> },
  { label: "Clothing", value: "clothing", icon: <Shirt className="w-5 h-5" /> },
  { label: "Rescue", value: "rescue", icon: <LifeBuoy className="w-5 h-5" /> },
];
