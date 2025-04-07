
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserCog, ShieldCheck, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/hooks/use-role";
import UserRoleDialog from "@/components/admin/users/UserRoleDialog";
import { makeUserAdmin, makeUserProfessional } from "@/integrations/supabase/admin-api";

type UserWithEmail = {
  id: string;
  name: string | null;
  role: string;
  email: string;
};

const UsersAdmin = () => {
  const { isAdmin } = useRole();
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPromoting, setIsPromoting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithEmail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, role");
      
      if (profilesError) throw profilesError;
      
      // Get user emails - this requires admin access
      const usersWithEmail: UserWithEmail[] = [];
      
      for (const profile of profiles || []) {
        try {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
            profile.id
          );
          
          if (userError) {
            console.error("Error fetching user details:", userError);
            usersWithEmail.push({
              ...profile,
              email: "Email não disponível"
            });
          } else {
            usersWithEmail.push({
              ...profile,
              email: userData.user?.email || "Email não disponível"
            });
          }
        } catch (error) {
          console.error("Error in user fetch loop:", error);
          usersWithEmail.push({
            ...profile,
            email: "Email não disponível"
          });
        }
      }
      
      setUsers(usersWithEmail);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (user: UserWithEmail) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };
  
  const handleMakeAdmin = async () => {
    if (!selectedUser) return;
    
    try {
      setIsPromoting(true);
      
      await makeUserAdmin(selectedUser.id);
      
      toast.success(`${selectedUser.name || 'Usuário'} foi promovido para administrador`);
      setIsDialogOpen(false);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, role: "admin" } : user
      ));
    } catch (error) {
      console.error("Error making admin:", error);
      toast.error("Erro ao promover usuário para administrador");
    } finally {
      setIsPromoting(false);
    }
  };
  
  const handleMakeProfessional = async () => {
    if (!selectedUser) return;
    
    try {
      setIsPromoting(true);
      
      await makeUserProfessional(selectedUser.id);
      
      toast.success(`${selectedUser.name || 'Usuário'} foi definido como profissional`);
      setIsDialogOpen(false);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, role: "professional" } : user
      ));
    } catch (error) {
      console.error("Error making professional:", error);
      toast.error("Erro ao definir usuário como profissional");
    } finally {
      setIsPromoting(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-playfair font-bold">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie os usuários cadastrados no sistema.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Gerencie os usuários e seus níveis de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando usuários...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "Sem nome"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className="capitalize">{user.role}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Alterar Função
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <UserRoleDialog
        user={selectedUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onMakeAdmin={handleMakeAdmin}
        onMakeProfessional={handleMakeProfessional}
        isPromoting={isPromoting}
      />
    </div>
  );
};

export default UsersAdmin;
