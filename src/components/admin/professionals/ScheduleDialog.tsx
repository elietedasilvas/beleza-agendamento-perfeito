
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

interface ScheduleDialogProps {
  professional: Professional;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSchedule: (day: string, times: string[]) => void;
}

const ScheduleDialog = ({
  professional,
  open,
  onOpenChange,
  onUpdateSchedule,
}: ScheduleDialogProps) => {
  const [selectedDay, setSelectedDay] = useState("Segunda");
  const [availableTimes, setAvailableTimes] = useState<string[]>(
    professional.schedule[selectedDay] || []
  );
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

export default ScheduleDialog;
