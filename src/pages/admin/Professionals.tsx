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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  ProfessionalsIcon, 
  ServicesIcon, 
  User, 
  Mail, 
  Phone, 
  Calendar as CalendarIcon,
  Save,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { services, professionals, Professional, Service } from "@/data/mockData";

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  role: z.string().min(2, {
    message: "Função deve ter pelo menos 2 caracteres.",
  }),
  about: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  image: z.string().url({
    message: "URL da imagem inválida.",
  }),
  services: z.array(z.string()).optional(),
});

const ScheduleDialog = ({ 
  professional, 
  open, 
  onOpenChange, 
  onUpdateSchedule 
}: {
  professional: Professional;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSchedule: (day: string, times: string[]) => void;
}) => {
  const [selectedDay, setSelectedDay] = useState("Segunda");
  const [availableTimes, setAvailableTimes] = useState<string[]>(professional.schedule[selectedDay] || []);
  const timeSlots = [
    "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  useEffect(() => {
    setAvailableTimes(professional.schedule[selectedDay] || []);
  }, [selectedDay, professional]);

  const toggleTimeSlot = (time: string) => {
    if (availableTimes.includes(time)) {
      setAvailableTimes(availableTimes.filter((t) => t !== time));
    } else {
      setAvailableTimes([...availableTimes, time].sort());
    }
  };

  const handleSave = () => {
    onUpdateSchedule(selectedDay, availableTimes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Horários</DialogTitle>
          <DialogDescription>
            Selecione os horários disponíveis para cada dia da semana.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Dia da Semana</h4>
              <Select onValueChange={(value) => setSelectedDay(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um dia" defaultValue={selectedDay} />
                </SelectTrigger>
                <SelectContent>
                  {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day) => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Horários Disponíveis</h4>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={availableTimes.includes(time) ? "default" : "outline"}
                    onClick={() => toggleTimeSlot(time)}
                    className="text-xs"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ProfessionalsAdmin = () => {
  const { toast } = useToast();
  const [professionalsList, setProfessionalsList] = useState<Professional[]>(
    window.updatedProfessionals || professionals
  );
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  useEffect(() => {
    // Update global state when professionals list changes
    window.updatedProfessionals = professionalsList;
  }, [professionalsList]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      about: "",
      image: "",
      services: [],
    },
  });
  
  const openEditDialog = (professional: Professional) => {
    setEditingProfessional(professional);
    form.setValue("name", professional.name);
    form.setValue("email", professional.email);
    form.setValue("role", professional.role);
    form.setValue("about", professional.about);
    form.setValue("image", professional.image);
    setSelectedServices(professional.services);
    setIsEditDialogOpen(true);
  };
  
  const closeEditDialog = () => {
    setEditingProfessional(null);
    form.reset();
    setIsEditDialogOpen(false);
  };
  
  const openDeleteDialog = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setEditingProfessional(null);
    setIsDeleteDialogOpen(false);
  };
  
  const handleSubmit = (data: any) => {
    if (editingProfessional) {
      // Atualizar profissional existente
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
      // Criar novo profissional
      const newProfessional = {
        id: generateId(),
        name: data.name,
        email: data.email,
        role: data.role,
        about: data.about,
        image: data.image,
        services: data.services,
        rating: editingProfessional?.rating || 5.0,
        reviewCount: editingProfessional?.reviewCount || 0,
        schedule: editingProfessional?.schedule || {}
      };
      
      setProfessionalsList([...professionalsList, newProfessional]);
      
      toast({
        title: "Profissional criado",
        description: `Profissional ${data.name} criado com sucesso.`,
      });
    }
    
    closeEditDialog();
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

  const openScheduleDialog = (professional: Professional) => {
    setSelectedProfessional(professional);
    setScheduleDialogOpen(true);
  };
  
  const closeScheduleDialog = () => {
    setSelectedProfessional(null);
    setScheduleDialogOpen(false);
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
    
    setSelectedProfessional(updatedProfessional);
    
    toast({
      title: "Agenda atualizada",
      description: `Horários de ${day} para ${selectedProfessional.name} atualizados com sucesso.`,
    });
  
    closeScheduleDialog();
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
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProfessional ? "Editar Profissional" : "Adicionar Profissional"}</DialogTitle>
            <DialogDescription>
              {editingProfessional
                ? "Edite os campos abaixo para atualizar o profissional."
                : "Preencha os campos abaixo para criar um novo profissional."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do profissional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <FormControl>
                      <Input placeholder="Função do profissional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição do profissional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="URL da imagem do profissional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    <FormLabel>Serviços</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service.id}`}
                            checked={selectedServices.includes(service.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedServices([...selectedServices, service.id]);
                                form.setValue("services", [...selectedServices, service.id]);
                              } else {
                                setSelectedServices(selectedServices.filter((id) => id !== service.id));
                                form.setValue("services", selectedServices.filter((id) => id !== service.id));
                              }
                            }}
                          />
                          <label
                            htmlFor={`service-${service.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {service.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={closeEditDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProfessional ? "Atualizar" : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Profissional</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir este profissional? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeDeleteDialog}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedProfessional && (
        <ScheduleDialog
          professional={selectedProfessional}
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          onUpdateSchedule={updateProfessionalSchedule}
        />
      )}
    </div>
  );
};

export default ProfessionalsAdmin;
