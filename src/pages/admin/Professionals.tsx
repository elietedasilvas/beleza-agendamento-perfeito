
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
import { Edit, Trash2, ShieldCheck, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Professional, Service, services, professionals } from "@/data/mockData";
import { makeUserAdmin, makeUserProfessional } from "@/integrations/supabase/admin-api";
import { useRole } from "@/hooks/use-role";

// Importando os componentes de diálogo
import EditProfessionalDialog from "@/components/admin/professionals/EditProfessionalDialog";
import DeleteProfessionalDialog from "@/components/admin/professionals/DeleteProfessionalDialog";
import ScheduleDialog from "@/components/admin/professionals/ScheduleDialog";
import PromoteUserDialog from "@/components/admin/professionals/PromoteUserDialog";

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

const ProfessionalsAdmin = () => {
  const { toast } = useToast();
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
  
  useEffect(() => {
    window.updatedProfessionals = professionalsList;
  }, [professionalsList]);
  
  // Handlers para o diálogo de edição
  const openEditDialog = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsEditDialogOpen(true);
  };
  
  const closeEditDialog = () => {
    setEditingProfessional(null);
    setIsEditDialogOpen(false);
  };
  
  const handleSubmit = (data: any) => {
    if (editingProfessional) {
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
      
      toast({
        title: "Profissional atualizado",
        description: `Profissional ${data.name} atualizado com sucesso.`,
      });
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
      
      toast({
        title: "Profissional criado",
        description: `Profissional ${data.name} criado com sucesso.`,
      });
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
  
  const handleDelete = () => {
    if (!editingProfessional) return;
    
    setProfessionalsList(
      professionalsList.filter(
        (professional) => professional.id !== editingProfessional.id
      )
    );
    
    toast({
      title: "Profissional excluído",
      description: `Profissional ${editingProfessional.name} excluído com sucesso.`,
    });
    
    closeDeleteDialog();
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
    
    toast({
      title: "Agenda atualizada",
      description: `Horários de ${day} para ${selectedProfessional.name} atualizados com sucesso.`,
    });
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
      
      toast({
        title: "Usuário promovido",
        description: `${editingProfessional.name} foi promovido para administrador com sucesso.`,
      });
      
      closePromoteDialog();
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
  
  const handleMakeProfessional = async () => {
    if (!editingProfessional) return;
    
    try {
      setIsPromoting(true);
      
      await makeUserProfessional(editingProfessional.id);
      
      toast({
        title: "Papel atualizado",
        description: `${editingProfessional.name} foi definido como profissional com sucesso.`,
      });
      
      closePromoteDialog();
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
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-playfair font-bold">Gerenciar Profissionais</h1>
        <p className="text-muted-foreground">Adicione, edite ou exclua profissionais da sua equipe.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Profissionais</CardTitle>
          <CardDescription>
            Visualize e gerencie os profissionais cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      
      {/* Diálogos refatorados como componentes */}
      <EditProfessionalDialog
        professional={editingProfessional}
        services={services}
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
    </div>
  );
};

export default ProfessionalsAdmin;
