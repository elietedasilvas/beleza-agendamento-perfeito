
import { supabase } from "./client";

/**
 * Promove um usuário para administrador
 * @param userId ID do usuário a ser promovido para administrador
 * @returns Promise com o resultado da operação
 */
export const makeUserAdmin = async (userId: string) => {
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData.session) {
    throw new Error("Usuário não está autenticado");
  }
  
  const { data, error } = await supabase.functions.invoke("manage-users", {
    body: {
      action: "make_admin",
      userId: userId
    }
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

/**
 * Atualiza o papel de um usuário para profissional
 * @param userId ID do usuário a ser atualizado
 * @returns Promise com o resultado da operação
 */
export const makeUserProfessional = async (userId: string) => {
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData.session) {
    throw new Error("Usuário não está autenticado");
  }
  
  // 1. Atualizar o perfil do usuário para "professional"
  const { data, error } = await supabase.functions.invoke("manage-users", {
    body: {
      action: "update_role",
      userId: userId,
      role: "professional"
    }
  });
  
  if (error) {
    throw error;
  }
  
  // 2. Verificar se o usuário já está na tabela de profissionais
  const { data: existingPro } = await supabase
    .from("professionals")
    .select("id")
    .eq("id", userId)
    .single();
  
  // 3. Se não estiver, adicione-o com dados padrão
  if (!existingPro) {
    // Adicionar o profissional à tabela de profissionais
    await supabase.from("professionals").insert({
      id: userId,
      bio: "Profissional experiente em diversos serviços de beleza.",
      active: true
    });
    
    // Obter alguns serviços para associar por padrão
    const { data: defaultServices } = await supabase
      .from("services")
      .select("id")
      .limit(3);
    
    // Associar serviços padrão ao profissional
    if (defaultServices && defaultServices.length > 0) {
      const professionalServices = defaultServices.map(service => ({
        professional_id: userId,
        service_id: service.id
      }));
      
      await supabase.from("professional_services").insert(professionalServices);
    }
    
    // Adicionar disponibilidade padrão (seg-sex, 9h às 18h)
    const defaultAvailability = [
      { day_of_week: 1, start_time: "09:00", end_time: "18:00", professional_id: userId },
      { day_of_week: 2, start_time: "09:00", end_time: "18:00", professional_id: userId },
      { day_of_week: 3, start_time: "09:00", end_time: "18:00", professional_id: userId },
      { day_of_week: 4, start_time: "09:00", end_time: "18:00", professional_id: userId },
      { day_of_week: 5, start_time: "09:00", end_time: "18:00", professional_id: userId }
    ];
    
    await supabase.from("availability").insert(defaultAvailability);
  }
  
  return data;
};
