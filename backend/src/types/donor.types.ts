export type DonationType = 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'other';

export interface DonorRequestBody {
  latitude: number;               
  longitude: number;              
  placename: string;          
  contactno: string;              
  accuracy: number;              
  items: DonationType[];         
  availableFrom?: string;        
  availableUntil?: string;       
  additionalNotes?: string;    
}
