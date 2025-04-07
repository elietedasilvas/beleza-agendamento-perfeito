
import { Professional } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface ProfessionalScheduleViewerProps {
  professional: Professional;
  daysOfWeek: string[];
  timeSlots: string[];
  onEditDay: (day: string) => void;
  getAvailableTimeSlots: (professional: Professional, day: string) => string[];
  isTimeSlotAvailable: (professional: Professional, day: string, timeSlot: string) => boolean;
}

const ProfessionalScheduleViewer = ({
  professional,
  daysOfWeek,
  timeSlots,
  onEditDay,
  getAvailableTimeSlots,
  isTimeSlotAvailable
}: ProfessionalScheduleViewerProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src={professional.image} 
              alt={professional.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <CardTitle>{professional.name}</CardTitle>
            <CardDescription>{professional.role}</CardDescription>
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
                  const isAvailable = isTimeSlotAvailable(professional, day, time);
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
                
                {getAvailableTimeSlots(professional, day).length === 0 && (
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
  );
};

export default ProfessionalScheduleViewer;
