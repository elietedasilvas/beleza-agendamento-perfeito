
import { useState, useEffect } from "react";
import { Professional } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScheduleDialogProps {
  professional: Professional;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSchedule: (day: string, times: string[]) => void;
}

const weekDayToNumber = {
  "Segunda": 1,
  "Terça": 2,
  "Quarta": 3,
  "Quinta": 4,
  "Sexta": 5,
  "Sábado": 6,
  "Domingo": 0
};

const ScheduleDialog = ({
  professional,
  open,
  onOpenChange,
  onUpdateSchedule,
}: ScheduleDialogProps) => {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState("Segunda");
  const [availableTimes, setAvailableTimes] = useState<string[]>(
    professional.schedule[selectedDay] || []
  );
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Primeiro, exclua todas as disponibilidades existentes para este profissional neste dia
      const dayNumber = weekDayToNumber[selectedDay as keyof typeof weekDayToNumber];
      
      await supabase
        .from("availability")
        .delete()
        .eq("professional_id", professional.id)
        .eq("day_of_week", dayNumber);
      
      // Depois, insira as novas disponibilidades
      if (availableTimes.length > 0) {
        const availabilityData = availableTimes.map(time => {
          // Calcula o horário de término (1 hora depois)
          const [hour, minute] = time.split(':').map(Number);
          const endHour = hour + 1;
          const endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          return {
            professional_id: professional.id,
            day_of_week: dayNumber,
            start_time: time,
            end_time: endTime
          };
        });
        
        const { error } = await supabase
          .from("availability")
          .insert(availabilityData);
        
        if (error) throw error;
      }
      
      // Notifica o componente pai sobre a mudança
      onUpdateSchedule(selectedDay, availableTimes);
      toast({
        title: "Horários atualizados",
        description: `Os horários para ${selectedDay} foram atualizados com sucesso.`
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os horários. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
              <Select 
                value={selectedDay} 
                onValueChange={(value) => setSelectedDay(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um dia" />
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
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDialog;
