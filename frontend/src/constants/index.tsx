import { Package, Droplet, Heart, Home, Users } from 'lucide-react';
import type { AffectedArea } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CEBU_CENTER: L.LatLngExpression = [10.3157, 123.8854];
export const CEBU_BOUNDS: L.LatLngBoundsExpression = [[9.5, 123.3], [11.5, 124.5]];

export const needOptions = [
  { value: 'food', label: 'Food', icon: <Package className="w-5 h-5" /> },
  { value: 'water', label: 'Water', icon: <Droplet className="w-5 h-5" /> },
  { value: 'medical', label: 'Medical', icon: <Heart className="w-5 h-5" /> },
  { value: 'shelter', label: 'Shelter', icon: <Home className="w-5 h-5" /> },
  { value: 'clothing', label: 'Clothing', icon: <Users className="w-5 h-5" /> },
  { value: 'other', label: 'Other', icon: <Package className="w-5 h-5" /> },
];

export const urgencyColors = {
  low: { bg: '#10b981', text: 'Low', light: '#d1fae5' },
  medium: { bg: '#f59e0b', text: 'Medium', light: '#fef3c7' },
  high: { bg: '#f97316', text: 'High', light: '#ffedd5' },
  critical: { bg: '#ef4444', text: 'Critical', light: '#fee2e2' },
};

export const affectedAreas: AffectedArea[] = [
  { name: 'Bogo City', coords: [11.0517, 124.0055], intensity: 'VII (Destructive)' },
  { name: 'San Remigio', coords: [11.0809, 123.9381], intensity: 'VI (Very Strong)' },
  { name: 'Medellin', coords: [11.1286, 123.9620], intensity: 'V (Strong)' },
  { name: 'Tabogon', coords: [10.9433, 124.0278], intensity: 'IV (Moderately Strong)' },
  { name: 'Tabuelan', coords: [10.8217, 123.8717], intensity: 'IV (Moderately Strong)' },
  { name: 'Sogod', coords: [10.7508, 123.9996], intensity: 'III (Weak)' },
];