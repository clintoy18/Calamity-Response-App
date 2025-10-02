export type NeedType = 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'other';

export interface EmergencyRequestBody {
  latitude: number;
  longitude: number;
  placename: string;
  contactno: string;
  accuracy: number;
  needs: NeedType[];
  numberOfPeople: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  additionalNotes?: string;
}
