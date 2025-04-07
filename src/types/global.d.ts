
import { Service as MockDataService, Professional as MockDataProfessional } from "@/data/mockData";

declare global {
  interface Window {
    updatedServices?: Service[];
    updatedProfessionals?: Professional[];
  }
  
  interface ProfessionalCredentials {
    id: string;
    email: string;
    name: string;
  }
}

export interface Professional {
  id: string;
  name: string;
  image?: string;
  role?: string;
  rating?: number;
  reviewCount?: number;
  bio?: string;
  active?: boolean;
  available?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  image?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type { MockDataService, MockDataProfessional };
