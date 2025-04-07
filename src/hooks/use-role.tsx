
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

type UserRole = "admin" | "professional" | "client";
type ProfilesResponse = Database["public"]["Tables"]["profiles"]["Row"];

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        } else if (data) {
          setRole(data.role as UserRole);
        }
      } catch (error) {
        console.error("Error in useRole hook:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === "admin";
  const isProfessional = role === "professional";
  const isClient = role === "client";

  return { role, isLoading, isAdmin, isProfessional, isClient };
};
