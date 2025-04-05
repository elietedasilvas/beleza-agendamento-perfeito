
import { useState } from "react";
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Check, Calendar } from "lucide-react";
import { 
  professionals, 
  services, 
  Professional 
} from "@/data/mockData";

const ProfessionalsAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [professionalsList, setProfessionalsList] = useState(professionals);
  const [selectedProfessionalForSchedule, setSelectedProfessionalForSchedule] = useState<Professional | null>(null);
  
  const form = useForm({
    defaultValues: {
      name: "",
      role: "",
      about: "",
      image: "",
      services: [] as string[],
    }
  });
  
  const scheduleForm = useForm({
    defaultValues: {
      Segunda: [],
      Terça: [],
      Quarta: [],
      Quinta: [],
      Sexta: [],
      Sábado: [],
      Domingo: [],
    }
  });
  
  const onOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingProfessional(null);
      form.reset({
        name: "",
        role: "",
        about: "",
        image: "",
        services: [],
      });
    }
  };
  
  const onScheduleOpenChange = (open: boolean) => {
    setIsScheduleDialogOpen(open);
    if (!open) {
      setSelectedProfessionalForSchedule(null);
    }
  };
  
  const onEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    form.reset({
      name: professional.name,
      role: professional.role,
      about: professional.about,
      image: professional.image,
      services: professional.services,
    });
    setIsDialogOpen(true);
  };
  
  const onEditSchedule = (professional: Professional) => {
    setSelectedProfessionalForSchedule(professional);
    
    // Set default values for the schedule form based on the selected professional
    const scheduleDefaults: Record<string, string[]> = {
      Segunda: [],
      Terça: [],
      Quarta: [],
      Quinta: [],
      Sexta: [],
      Sábado: [],
      Domingo: [],
    };
    
    // Fill with the professional's availability
    Object.keys(professional.availability).forEach(day => {
      scheduleDefaults[day] = professional.availability[day];
    });
    
    scheduleForm.reset(scheduleDefaults);
    setIsScheduleDialogOpen(true);
  };
  
  const onSubmit = (data: any) => {
    const newProfessional = {
      id: editingProfessional ? editingProfessional.id : `${professionalsList.length + 1}`,
      name: data.name,
      role: data.role,
      about: data.about,
      image: data.image,
      services: data.services,
      rating: editingProfessional ? editingProfessional.rating : 5.0,
      reviewCount: editingProfessional ? editingProfessional.reviewCount : 0,
      availability: editingProfessional ? editingProfessional.availability : {
        "Segunda": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        "Terça": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        "Quarta": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        "Quinta": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        "Sexta": ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      }
    };
    
    if (editingProfessional) {
      // Update existing professional
      setProfessionalsList(professionalsList.map(p => 
        p.id === editingProfessional.id ? newProfessional : p
      ));
    } else {
      // Add new professional
      setProfessionalsList([...professionalsList, newProfessional]);
    }
    
    setIsDialogOpen(false);
    setEditingProfessional(null);
    form.reset();
  };
  
  const onSubmitSchedule = (data: any) => {
    if (!selectedProfessionalForSchedule) return;
    
    // Filter out empty days
    const cleanedAvailability: Record<string, string[]> = {};
    
    Object.keys(data).forEach(day => {
      if (data[day] && data[day].length > 0) {
        cleanedAvailability[day] = data[day];
      }
    });
    
    // Update the professional with the new availability
    const updatedProfessional = {
      ...selectedProfessionalForSchedule,
      availability: cleanedAvailability
    };
    
    setProfessionalsList(professionalsList.map(p => 
      p.id === selectedProfessionalForSchedule.id ? updatedProfessional : p
    ));
    
    setIsScheduleDialogOpen(false);
    setSelectedProfessionalForSchedule(null);
  };
  
  const onDeleteProfessional = (id: string) => {
    setProfessionalsList(professionalsList.filter(p => p.id !== id));
  };
  
  // Time slots for schedule
  const timeSlots = [
    "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];
  
  // Days of the week
  const daysOfWeek = [
    "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Gerenciar Profissionais</h1>
          <p className="text-muted-foreground">Adicione, edite ou remova profissionais do salão.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button className="beauty-button">
              <Plus className="h-4 w-4" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingProfessional ? "Editar Profissional" : "Adicionar Novo Profissional"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do profissional abaixo.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ana Silva" {...field} />
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
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Esteticista Facial" {...field} />
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
                      <FormLabel>Sobre</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva a experiência e especialidades do profissional..." {...field} />
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
                        <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormItem>
                  <FormLabel>Serviços Oferecidos</FormLabel>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    {services.map(service => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`service-${service.id}`}
                          checked={form.watch("services").includes(service.id)}
                          onCheckedChange={(checked) => {
                            const currentServices = form.getValues("services");
                            if (checked) {
                              form.setValue("services", [...currentServices, service.id]);
                            } else {
                              form.setValue("services", currentServices.filter(id => id !== service.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`service-${service.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {service.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormItem>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProfessional ? "Salvar Alterações" : "Adicionar Profissional"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Schedule Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={onScheduleOpenChange}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>
                Gerenciar Agenda de {selectedProfessionalForSchedule?.name}
              </DialogTitle>
              <DialogDescription>
                Configure os horários disponíveis para cada dia da semana.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...scheduleForm}>
              <form onSubmit={scheduleForm.handleSubmit(onSubmitSchedule)} className="space-y-6">
                {daysOfWeek.map((day) => (
                  <FormField
                    key={day}
                    control={scheduleForm.control}
                    name={day as any}
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>{day}</FormLabel>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {timeSlots.map((time) => {
                            const isChecked = field.value?.includes(time);
                            return (
                              <div key={`${day}-${time}`} className="flex items-center space-x-1">
                                <Checkbox 
                                  id={`${day}-${time}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    const currentTimes = scheduleForm.getValues(day as any) || [];
                                    if (checked) {
                                      scheduleForm.setValue(day as any, [...currentTimes, time].sort());
                                    } else {
                                      scheduleForm.setValue(
                                        day as any, 
                                        currentTimes.filter(t => t !== time)
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`${day}-${time}`}
                                  className="text-xs whitespace-nowrap leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {time}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Agenda
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Serviços</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professionalsList.map((professional) => (
              <TableRow key={professional.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src={professional.image} 
                        alt={professional.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{professional.name}</span>
                  </div>
                </TableCell>
                <TableCell>{professional.role}</TableCell>
                <TableCell>
                  {professional.services.length} serviços
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{professional.rating}</span>
                    <span className="text-yellow-400">★</span>
                    <span className="text-muted-foreground text-xs">
                      ({professional.reviewCount})
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onEditSchedule(professional)}
                      title="Gerenciar agenda"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onEditProfessional(professional)}
                      title="Editar profissional"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-destructive" 
                      onClick={() => onDeleteProfessional(professional.id)}
                      title="Excluir profissional"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProfessionalsAdmin;
