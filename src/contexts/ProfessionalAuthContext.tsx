
import React, { createContext, useContext, useState, useEffect } from "react";
import { professionals } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

type ProfessionalAuth = {
  id: string;
  name: string;
  isAuthenticated: boolean;
};

interface ProfessionalAuthContextType {
  professionalAuth: ProfessionalAuth | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const ProfessionalAuthContext = createContext<ProfessionalAuthContextType | undefined>(undefined);

export const ProfessionalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [professionalAuth, setProfessionalAuth] = useState<ProfessionalAuth | null>(() => {
    const stored = localStorage.getItem('professionalAuth');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (professionalAuth) {
      localStorage.setItem('professionalAuth', JSON.stringify(professionalAuth));
    } else {
      localStorage.removeItem('professionalAuth');
    }
  }, [professionalAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Obter a lista atualizada de profissionais, se disponível
    const currentProfessionals = window.updatedProfessionals || professionals;
    
    // Procurar o profissional pelo email
    const professional = currentProfessionals.find(p => p.email === email);
    
    // Verificar credenciais (em produção seria com hash, aqui usamos senha fixa)
    if (professional && password === "senha123") {
      setProfessionalAuth({
        id: professional.id,
        name: professional.name,
        isAuthenticated: true
      });
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo(a), ${professional.name}!`,
      });
      return true;
    }
    
    toast({
      title: "Erro de autenticação",
      description: "Email ou senha incorretos",
      variant: "destructive"
    });
    return false;
  };

  const logout = () => {
    setProfessionalAuth(null);
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso",
    });
  };

  return (
    <ProfessionalAuthContext.Provider value={{ professionalAuth, login, logout }}>
      {children}
    </ProfessionalAuthContext.Provider>
  );
};

export const useProfessionalAuth = () => {
  const context = useContext(ProfessionalAuthContext);
  
  if (context === undefined) {
    throw new Error("useProfessionalAuth deve ser usado dentro de um ProfessionalAuthProvider");
  }
  
  return context;
};
