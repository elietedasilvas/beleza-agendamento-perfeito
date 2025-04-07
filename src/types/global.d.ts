
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
