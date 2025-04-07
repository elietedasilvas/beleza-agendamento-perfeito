
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
