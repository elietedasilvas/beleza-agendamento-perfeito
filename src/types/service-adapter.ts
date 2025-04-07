
/**
 * Este arquivo fornece funções para adaptar entre diferentes tipos de Service
 * usados no projeto (vindos do mockData e do Supabase).
 */

import { Service as MockService } from "@/data/mockData";
import { Service as SupabaseService } from "@/types/global.d";

/**
 * Converte um serviço do formato Supabase para o formato usado no mockData
 */
export function adaptToMockService(supabaseService: SupabaseService): MockService {
  return {
    id: supabaseService.id,
    name: supabaseService.name,
    description: supabaseService.description || "", // Garantir que nunca é undefined
    price: supabaseService.price,
    duration: supabaseService.duration,
    category: (supabaseService.category || "all") as "hair" | "face" | "body" | "barber",
    image: supabaseService.image || "",
  };
}

/**
 * Converte um serviço do formato mockData para o formato usado no Supabase
 */
export function adaptToSupabaseService(mockService: MockService): SupabaseService {
  return {
    id: mockService.id,
    name: mockService.name,
    description: mockService.description,
    price: mockService.price,
    duration: mockService.duration,
    category: mockService.category,
    image: mockService.image,
  };
}
