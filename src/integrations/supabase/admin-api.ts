
import { supabase } from "./client";
import { Service } from "@/types/global.d";

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
  
  return data;
};

/**
 * Cria um novo profissional no sistema
 * @param professionalData Dados do profissional a ser criado
 * @returns Promise com o resultado da operação
 */
export const createProfessional = async (professionalData: {
  name: string;
  email: string;
  password: string;
}) => {
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData.session) {
    throw new Error("Usuário não está autenticado");
  }
  
  const { data, error } = await supabase.functions.invoke("manage-users", {
    body: {
      action: "create_professional",
      name: professionalData.name,
      email: professionalData.email,
      password: professionalData.password
    }
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

/**
 * Adiciona um novo serviço ao sistema
 * @param serviceData Dados do serviço a ser adicionado
 * @returns Promise com o resultado da operação
 */
export const addService = async (serviceData: Partial<Service>) => {
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData.session) {
    throw new Error("Usuário não está autenticado");
  }
  
  // Garantir que o serviço tem categoria e imagem padrão se não fornecidos
  const completeServiceData = {
    ...serviceData,
    category: serviceData.category || "all",
    image: serviceData.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
  };
  
  // 1. Adicionar o serviço à tabela de serviços
  const { data, error } = await supabase
    .from("services")
    .insert(completeServiceData)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  // 2. Associar o novo serviço a todos os profissionais ativos
  if (data) {
    try {
      // Obter todos os profissionais ativos
      const { data: professionals } = await supabase
        .from("professionals")
        .select("id")
        .eq("active", true);
      
      if (professionals && professionals.length > 0) {
        // Criar registros de associação para cada profissional
        const professionalServices = professionals.map(professional => ({
          professional_id: professional.id,
          service_id: data.id
        }));
        
        // Inserir as associações na tabela de relação
        await supabase
          .from("professional_services")
          .insert(professionalServices);
      }
    } catch (associationError) {
      console.error("Erro ao associar serviço aos profissionais:", associationError);
      // Não interrompe o fluxo, apenas loga o erro
    }
  }
  
  return data;
};
