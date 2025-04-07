
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Professional } from "@/data/mockData";
import { Loader2 } from "lucide-react";
import ProfessionalSelector from "@/components/admin/professionals/ProfessionalSelector";
import ProfessionalScheduleViewer from "@/components/admin/professionals/ProfessionalScheduleViewer";
import ScheduleDialog from "@/components/admin/professionals/ScheduleDialog";

const ScheduleAdmin = () => {
  const { toast } = useToast();
  const [professionalsList, setProfessionalsList] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDay, setSelectedDay] = useState("Segunda");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const timeSlots = [
    "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];
  
  const daysOfWeek = [
    "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
  ];

  // Função para buscar os profissionais do Supabase
  const fetchProfessionals = async () => {
    setIsLoading(true);
    try {
      // Primeiro, buscamos os profissionais
      const { data: professionalsData, error: professionalsError } = await supabase
        .from("professionals")
        .select("id, active")
        .eq("active", true);
      
      if (professionalsError) {
        throw professionalsError;
      }

      // Depois, buscamos os perfis associados a esses profissionais
      if (professionalsData && professionalsData.length > 0) {
        const professionalIds = professionalsData.map(prof => prof.id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, role")
          .in("id", professionalIds)
          .eq("role", "professional");
        
        if (profilesError) {
          throw profilesError;
        }

        // Agora, buscamos as disponibilidades para cada profissional
        const updatedProfessionals: Professional[] = [];
        
        // Para cada profissional, vamos buscar sua disponibilidade
        for (const professional of professionalsData) {
          const profile = profilesData?.find(p => p.id === professional.id);
          
          if (profile) {
            const { data: availabilityData, error: availabilityError } = await supabase
              .from("availability")
              .select("day_of_week, start_time")
              .eq("professional_id", professional.id);
              
            if (availabilityError) {
              console.error("Erro ao buscar disponibilidade:", availabilityError);
              continue;
            }
            
            // Converter os dados de disponibilidade para o formato esperado
            // Mapear dia da semana de número para nome
            const schedule: { [key: string]: string[] } = {};
            const dayNumberToName: { [key: number]: string } = {
              0: "Domingo",
              1: "Segunda",
              2: "Terça",
              3: "Quarta",
              4: "Quinta", 
              5: "Sexta",
              6: "Sábado"
            };
            
            // Organizar horários por dia da semana
            if (availabilityData) {
              availabilityData.forEach(slot => {
                const dayName = dayNumberToName[slot.day_of_week];
                if (!schedule[dayName]) {
                  schedule[dayName] = [];
                }
                schedule[dayName].push(slot.start_time);
              });
            }
            
            updatedProfessionals.push({
              id: professional.id,
              name: profile.name || "Sem nome",
              role: "Professional",
              image: profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
              schedule: schedule,
              available: professional.active,
              description: "",
            });
          }
        }
        
        setProfessionalsList(updatedProfessionals);
      }
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);
  
  const onProfessionalChange = (professionalId: string) => {
    const professional = professionalsList.find(p => p.id === professionalId) || null;
    setSelectedProfessional(professional);
  };
  
  const onEditDay = (day: string) => {
    if (!selectedProfessional) return;
    
    setSelectedDay(day);
    setIsEditDialogOpen(true);
  };
  
  const onUpdateSchedule = (day: string, updatedTimes: string[]) => {
    if (!selectedProfessional) return;
    
    // Atualiza o profissional selecionado
    const updatedProfessional = { ...selectedProfessional };
    updatedProfessional.schedule = { ...updatedProfessional.schedule, [day]: updatedTimes };
    
    // Atualiza a lista completa de profissionais
    setProfessionalsList(professionalsList.map(p => 
      p.id === selectedProfessional.id ? updatedProfessional : p
    ));
    
    // Atualiza o profissional selecionado
    setSelectedProfessional(updatedProfessional);
    
    toast({
      title: "Agenda atualizada",
      description: `Horários de ${day} para ${selectedProfessional.name} atualizados com sucesso.`,
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
      
      <ProfessionalSelector 
        professionalsList={professionalsList}
        isLoading={isLoading}
        onProfessionalChange={onProfessionalChange}
      />
      
      {selectedProfessional && (
        <ProfessionalScheduleViewer 
          professional={selectedProfessional}
          daysOfWeek={daysOfWeek}
          timeSlots={timeSlots}
          onEditDay={onEditDay}
          getAvailableTimeSlots={getAvailableTimeSlots}
          isTimeSlotAvailable={isTimeSlotAvailable}
        />
      )}
      
      {selectedProfessional && (
        <ScheduleDialog
          professional={selectedProfessional}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdateSchedule={onUpdateSchedule}
        />
      )}
    </div>
  );
};

export default ScheduleAdmin;
