
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
import { Edit, Trash2, ShieldCheck, CalendarIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { Professional, Service, services, professionals } from "@/data/mockData";
import { makeUserAdmin, makeUserProfessional } from "@/integrations/supabase/admin-api";
import { useRole } from "@/hooks/use-role";
import { supabase } from "@/integrations/supabase/client";

// Importando os componentes de diálogo
import EditProfessionalDialog from "@/components/admin/professionals/EditProfessionalDialog";
import DeleteProfessionalDialog from "@/components/admin/professionals/DeleteProfessionalDialog";
import ScheduleDialog from "@/components/admin/professionals/ScheduleDialog";
import PromoteUserDialog from "@/components/admin/professionals/PromoteUserDialog";
import CreateProfessionalDialog from "@/components/admin/professionals/CreateProfessionalDialog";

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

const ProfessionalsAdmin = () => {
  const { isAdmin } = useRole();
  const [professionalsList, setProfessionalsList] = useState<Professional[]>(
    window.updatedProfessionals || professionals
  );
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [servicesList, setServicesList] = useState<Service[]>(services);
  
  useEffect(() => {
    fetchProfessionals();
    fetchServices();
  }, []);
  
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true);
      
      if (error) throw error;
      
      if (data) {
        // Adaptar os serviços para o formato usado no frontend
        const adaptedServices = data.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || "",
          price: service.price,
          duration: service.duration,
          category: (service.category || "all") as "hair" | "face" | "body" | "barber",
          image: service.image || ""
        }));
        
        setServicesList(adaptedServices);
      }
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      toast.error("Erro ao carregar serviços");
    }
  };
  
  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);
      
      // Fetch professional profiles
      const { data: professionalProfiles, error: profilesError } = await supabase
        .from("professionals")
        .select("id, bio, active")
        .eq("active", true);
      
      if (profilesError) throw profilesError;
      
      if (professionalProfiles && professionalProfiles.length > 0) {
        // Get user details for each professional
        const enhancedProfessionals = await Promise.all(
          professionalProfiles.map(async (pro) => {
            // Get profile data
            const { data: profileData } = await supabase
              .from("profiles")
              .select("name, role")
              .eq("id", pro.id)
              .single();
            
            // Get services for this professional
            const { data: proServices } = await supabase
              .from("professional_services")
              .select("service_id")
              .eq("professional_id", pro.id);
            
            const serviceIds = proServices ? proServices.map(s => s.service_id) : [];
            
            return {
              id: pro.id,
              name: profileData?.name || "Sem nome",
              role: profileData?.role || "professional",
              email: "professional@example.com", // Placeholder, will be updated
              about: pro.bio || "",
              services: serviceIds,
              image: "/placeholder.svg",
              rating: 5.0,
              reviewCount: 0,
              schedule: {}
            };
          })
        );
        
        // Update emails if possible 
        for (let i = 0; i < enhancedProfessionals.length; i++) {
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(
              enhancedProfessionals[i].id
            );
            
            if (userData && userData.user) {
              enhancedProfessionals[i].email = userData.user.email || "Email não disponível";
            }
          } catch (error) {
            console.error("Error fetching user email:", error);
          }
        }
        
        setProfessionalsList(enhancedProfessionals);
        window.updatedProfessionals = enhancedProfessionals;
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
      toast.error("Erro ao carregar profissionais");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handlers para o diálogo de edição
  const openEditDialog = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsEditDialogOpen(true);
  };
  
  const closeEditDialog = () => {
    setEditingProfessional(null);
    setIsEditDialogOpen(false);
  };
  
  const handleSubmit = async (data: any) => {
    if (editingProfessional) {
      try {
        // Atualizar o perfil do profissional
        const { error: profileError } = await supabase
          .from("professionals")
          .update({
            bio: data.about
          })
          .eq("id", editingProfessional.id);
          
        if (profileError) throw profileError;
        
        // Atualizar nome e papel no perfil geral
        const { error: userProfileError } = await supabase
          .from("profiles")
          .update({
            name: data.name,
            role: data.role
          })
          .eq("id", editingProfessional.id);
          
        if (userProfileError) throw userProfileError;
        
        // Gerenciar os serviços do profissional
        // 1. Identificar novos serviços para adicionar
        const originalServices = data.originalServices || [];
        const servicesToAdd = data.services.filter(
          (serviceId: string) => !originalServices.includes(serviceId)
        );
        
        // 2. Identificar serviços para remover
        const servicesToRemove = originalServices.filter(
          (serviceId: string) => !data.services.includes(serviceId)
        );
        
        // 3. Adicionar novos serviços
        if (servicesToAdd.length > 0) {
          const servicesToInsert = servicesToAdd.map((serviceId: string) => ({
            professional_id: editingProfessional.id,
            service_id: serviceId
          }));
          
          const { error: addServicesError } = await supabase
            .from("professional_services")
            .insert(servicesToInsert);
            
          if (addServicesError) throw addServicesError;
        }
        
        // 4. Remover serviços desmarcados
        if (servicesToRemove.length > 0) {
          for (const serviceId of servicesToRemove) {
            const { error: removeServiceError } = await supabase
              .from("professional_services")
              .delete()
              .eq("professional_id", editingProfessional.id)
              .eq("service_id", serviceId);
              
            if (removeServiceError) throw removeServiceError;
          }
        }
        
        // Atualizar a lista local
        const updatedProfessional = {
          ...editingProfessional,
          name: data.name,
          email: data.email,
          role: data.role,
          about: data.about,
          image: data.image,
          services: data.services,
        };
        
        setProfessionalsList(
          professionalsList.map((professional) =>
            professional.id === editingProfessional.id ? updatedProfessional : professional
          )
        );
        
        toast.success(`Profissional ${data.name} atualizado com sucesso.`);
        
        // Recarregar os profissionais para garantir que temos os dados mais atualizados
        fetchProfessionals();
      } catch (error) {
        console.error("Erro ao atualizar profissional:", error);
        toast.error("Erro ao atualizar profissional. Tente novamente.");
      }
    } else {
      const newProfessional = {
        id: generateId(),
        name: data.name,
        email: data.email,
        role: data.role,
        about: data.about,
        image: data.image,
        services: data.services,
        rating: 5.0,
        reviewCount: 0,
        schedule: {}
      };
      
      setProfessionalsList([...professionalsList, newProfessional]);
      
      toast.success(`Profissional ${data.name} criado com sucesso.`);
    }
    
    closeEditDialog();
  };
  
  // Handlers para o diálogo de exclusão
  const openDeleteDialog = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setEditingProfessional(null);
    setIsDeleteDialogOpen(false);
  };
  
  const handleDelete = async () => {
    if (!editingProfessional) return;
    
    try {
      // Desativar o profissional em vez de excluir completamente
      const { error } = await supabase
        .from("professionals")
        .update({ active: false })
        .eq("id", editingProfessional.id);
        
      if (error) throw error;
      
      // Atualizar a lista local
      setProfessionalsList(
        professionalsList.filter(
          (professional) => professional.id !== editingProfessional.id
        )
      );
      
      toast.success(`Profissional ${editingProfessional.name} desativado com sucesso.`);
      
      closeDeleteDialog();
      
    } catch (error) {
      console.error("Erro ao desativar profissional:", error);
      toast.error("Erro ao desativar profissional. Tente novamente.");
    }
  };

  // Handlers para o diálogo de agenda
  const openScheduleDialog = (professional: Professional) => {
    setSelectedProfessional(professional);
    setScheduleDialogOpen(true);
  };
  
  const updateProfessionalSchedule = (day: string, times: string[]) => {
    if (!selectedProfessional) return;
    
    const updatedProfessional = {
      ...selectedProfessional,
      schedule: {
        ...selectedProfessional.schedule,
        [day]: times
      }
    };
    
    setProfessionalsList(professionalsList.map(p => 
      p.id === selectedProfessional.id ? updatedProfessional : p
    ));
    
    toast.success(`Horários de ${day} para ${selectedProfessional.name} atualizados com sucesso.`);
  };
  
  // Handlers para o diálogo de promoção
  const openPromoteDialog = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsPromoteDialogOpen(true);
  };
  
  const closePromoteDialog = () => {
    setEditingProfessional(null);
    setIsPromoteDialogOpen(false);
  };
  
  const handlePromoteToAdmin = async () => {
    if (!editingProfessional) return;
    
    try {
      setIsPromoting(true);
      
      await makeUserAdmin(editingProfessional.id);
      
      toast.success(`${editingProfessional.name} foi promovido para administrador com sucesso.`);
      
      // Atualizar a lista local
      const updatedProfessional = {
        ...editingProfessional,
        role: "admin"
      };
      
      setProfessionalsList(
        professionalsList.map((professional) =>
          professional.id === editingProfessional.id ? updatedProfessional : professional
        )
      );
      
      closePromoteDialog();
    } catch (error) {
      console.error("Erro ao promover usuário:", error);
      toast.error("Não foi possível promover o usuário para administrador.");
    } finally {
      setIsPromoting(false);
    }
  };
  
  const handleMakeProfessional = async () => {
    if (!editingProfessional) return;
    
    try {
      setIsPromoting(true);
      
      await makeUserProfessional(editingProfessional.id);
      
      toast.success(`${editingProfessional.name} foi definido como profissional com sucesso.`);
      
      // Atualizar a lista local
      const updatedProfessional = {
        ...editingProfessional,
        role: "professional"
      };
      
      setProfessionalsList(
        professionalsList.map((professional) =>
          professional.id === editingProfessional.id ? updatedProfessional : professional
        )
      );
      
      closePromoteDialog();
    } catch (error) {
      console.error("Erro ao definir usuário como profissional:", error);
      toast.error("Não foi possível definir o usuário como profissional.");
    } finally {
      setIsPromoting(false);
    }
  };

  // Handler para o diálogo de criação de profissional
  const handleCreateSuccess = (newProfessional: any) => {
    // Recarregar a lista de profissionais após criar um novo
    fetchProfessionals();
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Gerenciar Profissionais</h1>
          <p className="text-muted-foreground">Adicione, edite ou exclua profissionais da sua equipe.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Profissional
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Profissionais</CardTitle>
          <CardDescription>
            Visualize e gerencie os profissionais cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando profissionais...</div>
          ) : professionalsList.length === 0 ? (
            <div className="text-center py-4">Nenhum profissional encontrado.</div>
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
                {professionalsList.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">{professional.name}</TableCell>
                    <TableCell>{professional.email}</TableCell>
                    <TableCell>{professional.role}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openScheduleDialog(professional)}
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon"
                          onClick={() => openEditDialog(professional)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openPromoteDialog(professional)}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => openDeleteDialog(professional)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Diálogos refatorados como componentes */}
      <EditProfessionalDialog
        professional={editingProfessional}
        services={servicesList}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleSubmit}
      />
      
      <DeleteProfessionalDialog
        professional={editingProfessional}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
      />

      {selectedProfessional && (
        <ScheduleDialog
          professional={selectedProfessional}
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          onUpdateSchedule={updateProfessionalSchedule}
        />
      )}

      <PromoteUserDialog
        professional={editingProfessional}
        open={isPromoteDialogOpen}
        onOpenChange={setIsPromoteDialogOpen}
        onPromoteAdmin={handlePromoteToAdmin}
        onMakeProfessional={handleMakeProfessional}
        isPromoting={isPromoting}
      />

      <CreateProfessionalDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default ProfessionalsAdmin;
