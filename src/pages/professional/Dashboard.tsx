
import { useState } from "react";
import { useProfessionalAuth } from "@/contexts/ProfessionalAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { format, isSameDay } from "date-fns";
import { professionals, services, getServicesByProfessional } from "@/data/mockData";
import { Clock, Scissors, User, Calendar as CalendarIcon } from "lucide-react";

// Simulação de agendamentos para o profissional logado
const mockAppointments = [
  {
    id: "1",
    serviceId: "1",
    professionalId: "3",
    client: "Maria Fernandes",
    phone: "(11) 98765-4321",
    date: "2025-04-10",
    time: "14:00",
    status: "scheduled"
  },
  {
    id: "5",
    serviceId: "5",
    professionalId: "3",
    client: "Beatriz Almeida",
    phone: "(11) 98901-2345",
    date: "2025-04-15",
    time: "16:00",
    status: "scheduled"
  },
  {
    id: "6",
    serviceId: "2",
    professionalId: "3",
    client: "Luiza Santos",
    phone: "(11) 97654-3210",
    date: "2025-04-07",
    time: "09:00",
    status: "scheduled"
  }
];

const ProfessionalDashboard = () => {
  const { professionalAuth } = useProfessionalAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Encontrar detalhes do profissional
  const professionalDetails = professionals.find(p => p.id === professionalAuth?.id);
  const professionalServices = getServicesByProfessional(professionalAuth?.id || "");
  
  // Filtrar agendamentos para o profissional logado
  const myAppointments = mockAppointments.filter(
    appointment => appointment.professionalId === professionalAuth?.id
  );
  
  // Filtrar agendamentos pela data selecionada
  const appointmentsForSelectedDate = date 
    ? myAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return isSameDay(appointmentDate, date);
      })
    : [];
  
  // Função para formatar data
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };
  
  // Obter nome do serviço
  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || "Serviço não encontrado";
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-playfair font-bold">
          Olá, {professionalAuth?.name}!
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo à sua área de gerenciamento de agendamentos
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Side panel with calendar and quick info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Seu Calendário</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="border rounded-md"
            />
            
            <div className="mt-6 space-y-4">
              <div className="border rounded-md p-3 space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Seus Serviços
                </h3>
                <ul className="text-sm text-muted-foreground">
                  {professionalServices.length > 0 ? (
                    professionalServices.map(service => (
                      <li key={service.id} className="flex items-center gap-1">
                        <span>•</span>
                        <span>{service.name}</span>
                      </li>
                    ))
                  ) : (
                    <li>Nenhum serviço registrado</li>
                  )}
                </ul>
              </div>
              
              <div className="border rounded-md p-3 space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Próximos Agendamentos
                </h3>
                <p className="text-sm text-muted-foreground">
                  {myAppointments.length} agendamento(s) registrado(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main content with tabs */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl">Gerenciamento de Agenda</CardTitle>
            <CardDescription>
              {date 
                ? `Agendamentos para ${format(date, "d 'de' MMMM", { locale: ptBR })}`
                : "Selecione uma data para ver agendamentos"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="appointments">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
                <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments" className="space-y-4 mt-4">
                {appointmentsForSelectedDate.length > 0 ? (
                  appointmentsForSelectedDate.map(appointment => (
                    <div key={appointment.id} className="border rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <h3 className="font-medium">{appointment.client}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.phone}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{getServiceName(appointment.serviceId)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Agendado
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento para esta data.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="availability" className="space-y-4 mt-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Horários disponíveis</h3>
                  
                  {professionalDetails?.schedule ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(professionalDetails.schedule).map(([day, slots]) => (
                        <div key={day} className="border rounded p-3">
                          <h4 className="font-medium mb-2 capitalize">{day}</h4>
                          <div className="flex flex-wrap gap-2">
                            {slots.length > 0 ? (
                              slots.map((time, index) => (
                                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  {time}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">Indisponível</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhum horário configurado.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
