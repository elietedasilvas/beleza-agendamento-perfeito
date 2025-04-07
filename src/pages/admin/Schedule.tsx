import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { professionals, Professional } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Clock, User, Calendar as CalendarIcon, Save } from "lucide-react";

const ScheduleAdmin = () => {
  const { toast } = useToast();
  const [professionalsList, setProfessionalsList] = useState<Professional[]>(
    window.updatedProfessionals || professionals
  );
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDay, setSelectedDay] = useState("Segunda");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    window.updatedProfessionals = professionalsList;
  }, [professionalsList]);
  
  const form = useForm({
    defaultValues: {
      timeSlots: [] as string[],
    }
  });
  
  const timeSlots = [
    "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];
  
  const daysOfWeek = [
    "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
  ];
  
  const onProfessionalChange = (professionalId: string) => {
    const professional = professionalsList.find(p => p.id === professionalId) || null;
    setSelectedProfessional(professional);
  };
  
  const onEditDay = (day: string) => {
    if (!selectedProfessional) return;
    
    setSelectedDay(day);
    
    const dayAvailability = selectedProfessional.schedule[day] || [];
    form.setValue("timeSlots", dayAvailability);
    
    setIsEditDialogOpen(true);
  };
  
  const onSubmitTimeSlots = (data: { timeSlots: string[] }) => {
    if (!selectedProfessional || !selectedDay) return;
    
    const updatedProfessional = { ...selectedProfessional };
    
    updatedProfessional.schedule = { 
      ...updatedProfessional.schedule,
      [selectedDay]: data.timeSlots
    };
    
    setProfessionalsList(professionalsList.map(p => 
      p.id === selectedProfessional.id ? updatedProfessional : p
    ));
    
    setSelectedProfessional(updatedProfessional);
    
    setIsEditDialogOpen(false);
    
    toast({
      title: "Agenda atualizada",
      description: `Horários de ${selectedDay} para ${selectedProfessional.name} atualizados com sucesso.`,
    });
  };
  
  const getAvailableTimeSlots = (professional: Professional, day: string) => {
    return professional.schedule[day] || [];
  };
  
  const isTimeSlotAvailable = (professional: Professional, day: string, timeSlot: string) => {
    const availableSlots = getAvailableTimeSlots(professional, day);
    return availableSlots.includes(timeSlot);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-playfair font-bold">Gerenciar Agenda</h1>
        <p className="text-muted-foreground">Configure os horários disponíveis para cada profissional.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Selecione um Profissional</CardTitle>
          <CardDescription>
            Escolha um profissional para gerenciar sua agenda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={onProfessionalChange}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionalsList.map(professional => (
                <SelectItem key={professional.id} value={professional.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{professional.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {selectedProfessional && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={selectedProfessional.image} 
                  alt={selectedProfessional.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <CardTitle>{selectedProfessional.name}</CardTitle>
                <CardDescription>{selectedProfessional.role}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="Segunda">
              <TabsList className="grid grid-cols-7 h-auto">
                {daysOfWeek.map(day => (
                  <TabsTrigger 
                    key={day} 
                    value={day}
                    className="text-xs py-2"
                  >
                    {day}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {daysOfWeek.map(day => (
                <TabsContent key={day} value={day} className="p-4 border rounded-md mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{day}</h3>
                    <Button variant="outline" size="sm" onClick={() => onEditDay(day)}>
                      <Clock className="h-4 w-4 mr-2" />
                      Editar Horários
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {timeSlots.map(time => {
                      const isAvailable = isTimeSlotAvailable(selectedProfessional, day, time);
                      return (
                        <div
                          key={time}
                          className={`px-3 py-2 rounded-md text-center text-sm ${
                            isAvailable 
                              ? "bg-green-100 text-green-800 border border-green-200" 
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          {time}
                        </div>
                      );
                    })}
                    
                    {getAvailableTimeSlots(selectedProfessional, day).length === 0 && (
                      <div className="col-span-full text-center text-muted-foreground py-4">
                        Não há horários disponíveis para {day}.
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Editar Horários de {selectedDay}
            </DialogTitle>
            <DialogDescription>
              Selecione os horários disponíveis para {selectedProfessional?.name} em {selectedDay}.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitTimeSlots)} className="space-y-4">
              <FormField
                control={form.control}
                name="timeSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horários Disponíveis</FormLabel>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {timeSlots.map((time) => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`time-${time}`}
                            checked={field.value?.includes(time)}
                            onCheckedChange={(checked) => {
                              const currentTimes = form.getValues("timeSlots") || [];
                              if (checked) {
                                form.setValue("timeSlots", [...currentTimes, time].sort());
                              } else {
                                form.setValue("timeSlots", currentTimes.filter(t => t !== time));
                              }
                            }}
                          />
                          <label
                            htmlFor={`time-${time}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {time}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Horários
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleAdmin;
