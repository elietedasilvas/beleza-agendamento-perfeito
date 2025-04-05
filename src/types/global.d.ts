
import { Service } from "@/data/mockData";

declare global {
  interface Window {
    updatedServices?: Service[];
  }
}
