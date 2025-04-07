
import { useState, useEffect } from "react";
import { useProfessionalAuth } from "@/contexts/ProfessionalAuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { professionals } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Clock, Save, Plus, Trash, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Lista de dias da semana
const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

// Lista de horários disponíveis para seleção
const availableTimeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

const ProfessionalSchedule = () => {
  const { professionalAuth } = useProfessionalAuth();
  const { toast } = useToast();
  
  // Encontra os dados do profissional logado
  const [professionalDetails, setProfessionalDetails] = useState<any>(null);
  const [schedule, setSchedule] = useState<{ [key: string]: string[] }>({});
  const [isAddTimeDialogOpen, setIsAddTimeDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  // Carregar dados do profissional
  useEffect(() => {
    if (professionalAuth?.id) {
      const professional = professionals.find(p => p.id === professionalAuth.id);
      if (professional) {
        setProfessionalDetails(professional);
        
        // Inicializar o cronograma com os horários existentes ou vazio para cada dia
        const initialSchedule: {[key: string]: string[]} = {};
        weekDays.forEach(day => {
          initialSchedule[day] = professional.schedule?.[day] || [];
        });
        
        setSchedule(initialSchedule);
      }
    }
  }, [professionalAuth?.id]);
  
  // Função para adicionar um novo horário
  const handleAddTime = () => {
    if (!selectedDay || !selectedTime) {
      toast({
        title: "Erro",
        description: "Selecione o dia e horário",
        variant: "destructive"
      });
      return;
    }
    
    // Verifica se o horário já existe
    if (schedule[selectedDay].includes(selectedTime)) {
      toast({
        title: "Horário já existe",
        description: `${selectedTime} já está adicionado para ${selectedDay}`,
        variant: "destructive"
      });
      return;
    }
    
    // Adiciona o novo horário e ordena
    const updatedTimes = [...schedule[selectedDay], selectedTime].sort();
    setSchedule({
      ...schedule,
      [selectedDay]: updatedTimes
    });
    
    setIsAddTimeDialogOpen(false);
    setSelectedTime("");
    
    toast({
      title: "Horário adicionado",
      description: `${selectedTime} adicionado para ${selectedDay}`,
    });
  };
  
  // Função para remover um horário
  const handleRemoveTime = (day: string, time: string) => {
    const updatedTimes = schedule[day].filter(t => t !== time);
    setSchedule({
      ...schedule,
      [day]: updatedTimes
    });
    
    toast({
      title: "Horário removido",
      description: `${time} removido de ${day}`,
    });
  };
  
  // Função para ativar/desativar um dia inteiro
  const toggleDay = (day: string, enabled: boolean) => {
    if (!enabled) {
      setSchedule({
        ...schedule,
        [day]: []
      });
      
      toast({
        title: "Dia desativado",
        description: `Todos os horários de ${day} foram removidos`,
      });
    }
  };
  
  // Função para salvar as alterações
  const saveChanges = () => {
    // Em um ambiente real, isso enviaria as alterações para o servidor
    // Para o mock, apenas exibimos um toast de sucesso
    
    // Atualizamos o dado local
    if (professionalDetails) {
      const updatedProfessionalDetails = {
        ...professionalDetails,
        schedule: schedule
      };
      setProfessionalDetails(updatedProfessionalDetails);
      
      // No ambiente real, aqui teria uma chamada à API
      
      toast({
        title: "Alterações salvas",
        description: "Sua disponibilidade foi atualizada com sucesso.",
      });
      
      // Em uma implementação real, atualizaríamos o contexto global ou faríamos fetch novamente
      // Para simular isso no mock, vamos atualizar uma variável global
      if (typeof window !== "undefined") {
        // @ts-ignore - ignorando o erro do TypeScript aqui pois é apenas para o mock
        window.updatedProfessionals = professionals.map(p => 
          p.id === professionalAuth?.id ? { ...p, schedule } : p
        );
      }
    }
  };
  
  if (!professionalDetails) {
    return <div className="text-center py-10">Carregando...</div>;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-playfair font-bold">
          Gerenciar Disponibilidade
        </h1>
        <p className="text-muted-foreground">
          Configure os dias e horários em que você está disponível para atendimento
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Meus Horários Disponíveis</CardTitle>
            <CardDescription>
              Defina em quais dias e horários você pode atender clientes
            </CardDescription>
          </div>
          <Button onClick={saveChanges}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={weekDays[0].toLowerCase()}>
            <TabsList className="grid grid-cols-7 mb-4">
              {weekDays.map(day => (
                <TabsTrigger 
                  key={day} 
                  value={day.toLowerCase()}
                  className={schedule[day].length === 0 ? "text-muted-foreground" : ""}
                >
                  {day.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {weekDays.map(day => (
              <TabsContent key={day} value={day.toLowerCase()} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{day}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {schedule[day].length === 0 ? "Indisponível" : "Disponível"}
                    </span>
                    <Switch 
                      checked={schedule[day].length > 0}
                      onCheckedChange={(checked) => toggleDay(day, checked)}
                    />
                  </div>
                </div>
                
                {schedule[day].length > 0 ? (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                      {schedule[day].map(time => (
                        <div 
                          key={`${day}-${time}`} 
                          className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2"
                        >
                          <span className="text-sm flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-primary" />
                            {time}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
                            onClick={() => handleRemoveTime(day, time)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedDay(day);
                        setIsAddTimeDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Horário
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                    <Clock className="h-10 w-10 mb-2 opacity-20" />
                    <p>Você não tem horários disponíveis neste dia.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        setSelectedDay(day);
                        setIsAddTimeDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Horário
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Dialog para adicionar novo horário */}
      <Dialog open={isAddTimeDialogOpen} onOpenChange={setIsAddTimeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Horário</DialogTitle>
            <DialogDescription>
              Selecione o horário que deseja adicionar para {selectedDay}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots
                  .filter(time => !schedule[selectedDay]?.includes(time))
                  .map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTimeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddTime}
              disabled={!selectedTime}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalSchedule;
