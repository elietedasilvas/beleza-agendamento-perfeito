
import { Service, Professional } from "@/data/mockData";

declare global {
  interface Window {
    updatedServices?: Service[];
    updatedProfessionals?: Professional[];
  }
}
