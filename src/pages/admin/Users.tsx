
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Scissors, ShieldCheck, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { makeUserAdmin, makeUserProfessional } from "@/integrations/supabase/admin-api";
import { useRole } from "@/hooks/use-role";
import { Skeleton } from "@/components/ui/skeleton";
import UserRoleDialog from "@/components/admin/users/UserRoleDialog";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "professional" | "client";
  created_at: string;
};

const UsersAdmin = () => {
  const { toast } = useToast();
  const { isAdmin } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  // Buscar a lista de usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, role, created_at");

        if (error) {
          console.error("Erro ao buscar usuários:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar a lista de usuários.",
            variant: "destructive",
          });
        } else {
          // Buscar emails dos usuários
          const authUsers = await Promise.all(
            data.map(async (profile) => {
              // Buscar detalhes do usuário
              const { data: userData, error: userError } = await supabase
                .from("profiles")
                .select("id, name, role, created_at")
                .eq("id", profile.id)
                .single();

              if (userError) {
                console.error("Erro ao buscar detalhes do usuário:", userError);
                return {
                  ...profile,
                  email: "Email não disponível",
                };
              }

              return {
                ...profile,
                email: userData.email || "Email não disponível",
              };
            })
          );

          setUsers(authUsers as User[]);
        }
      } catch (error) {
        console.error("Erro inesperado:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro inesperado ao carregar os usuários.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, toast]);

  // Abrir diálogo para gerenciar papel do usuário
  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };

  // Fechar diálogo de papel
  const closeRoleDialog = () => {
    setSelectedUser(null);
    setIsRoleDialogOpen(false);
  };

  // Promover usuário para administrador
  const handlePromoteToAdmin = async () => {
    if (!selectedUser) return;
    
    try {
      setIsPromoting(true);
      
      await makeUserAdmin(selectedUser.id);
      
      // Atualizar lista de usuários
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, role: "admin" } : user
        )
      );
      
      toast({
        title: "Usuário promovido",
        description: `${selectedUser.name || selectedUser.email} foi promovido para administrador com sucesso.`,
      });
      
      closeRoleDialog();
    } catch (error) {
      console.error("Erro ao promover usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível promover o usuário para administrador.",
        variant: "destructive",
      });
    } finally {
      setIsPromoting(false);
    }
  };
  
  // Definir usuário como profissional
  const handleMakeProfessional = async () => {
    if (!selectedUser) return;
    
    try {
      setIsPromoting(true);
      
      await makeUserProfessional(selectedUser.id);
      
      // Atualizar lista de usuários
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, role: "professional" } : user
        )
      );
      
      toast({
        title: "Papel atualizado",
        description: `${selectedUser.name || selectedUser.email} foi definido como profissional com sucesso.`,
      });
      
      closeRoleDialog();
    } catch (error) {
      console.error("Erro ao definir usuário como profissional:", error);
      toast({
        title: "Erro",
        description: "Não foi possível definir o usuário como profissional.",
        variant: "destructive",
      });
    } finally {
      setIsPromoting(false);
    }
  };

  // Renderizar skeleton durante carregamento
  if (loading) {
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
              Carregando usuários...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Visualize e gerencie os usuários cadastrados no sistema. Você pode promover clientes para profissionais ou administradores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "Sem nome"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin" 
                          ? "bg-purple-100 text-purple-800" 
                          : user.role === "professional" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role === "admin" 
                          ? "Administrador" 
                          : user.role === "professional" 
                          ? "Profissional" 
                          : "Cliente"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRoleDialog(user)}
                        disabled={user.role === "admin"}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Gerenciar Papel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo para gerenciar papel do usuário */}
      <UserRoleDialog
        user={selectedUser}
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        onPromoteAdmin={handlePromoteToAdmin}
        onMakeProfessional={handleMakeProfessional}
        isPromoting={isPromoting}
      />
    </div>
  );
};

export default UsersAdmin;
