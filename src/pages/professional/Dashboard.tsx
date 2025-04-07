
import { useState } from "react";
import { useProfessionalAuth } from "@/contexts/ProfessionalAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { format, isSameDay, parseISO, addDays } from "date-fns";
import { professionals, services, getServicesByProfessional } from "@/data/mockData";
import { Clock, Scissors, User, Calendar as CalendarIcon, Check, X, Edit, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Simulação de agendamentos para o profissional logado
const mockAppointments = [
  {
    id: "1",
    serviceId: "1",
    professionalId: "3",
    client: "Maria Fernandes",
    phone: "(11) 98765-4321",
    email: "maria.fernandes@example.com",
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
    email: "beatriz.almeida@example.com",
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
    email: "luiza.santos@example.com",
    date: "2025-04-07",
    time: "09:00",
    status: "scheduled"
  }
];

const ProfessionalDashboard = () => {
  const { professionalAuth } = useProfessionalAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState(mockAppointments);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedNewDate, setSelectedNewDate] = useState<Date | undefined>(undefined);
  const [selectedNewTime, setSelectedNewTime] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  // Encontrar detalhes do profissional
  const professionalDetails = professionals.find(p => p.id === professionalAuth?.id);
  const professionalServices = getServicesByProfessional(professionalAuth?.id || "");
  
  // Filtrar agendamentos para o profissional logado
  const myAppointments = appointments.filter(
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

  // Gerar horários disponíveis
  const availableTimes = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Funções para gerenciar agendamentos
  const confirmAppointment = (appointmentId: string) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: "confirmed" } 
        : appointment
    ));
    
    toast({
      title: "Agendamento confirmado",
      description: "O cliente será notificado da confirmação."
    });
  };

  const cancelAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsAlertDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (selectedAppointment) {
      setAppointments(appointments.map(appointment => 
        appointment.id === selectedAppointment.id 
          ? { ...appointment, status: "cancelled" } 
          : appointment
      ));
      
      toast({
        title: "Agendamento cancelado",
        description: "O cliente será notificado do cancelamento."
      });
    }
    
    setIsAlertDialogOpen(false);
    setSelectedAppointment(null);
  };

  const openRescheduleDialog = (appointment: any) => {
    setSelectedAppointment(appointment);
    setSelectedNewDate(parseISO(appointment.date));
    setSelectedNewTime(appointment.time);
    setIsEditDialogOpen(true);
  };

  const handleReschedule = () => {
    if (selectedAppointment && selectedNewDate && selectedNewTime) {
      const formattedDate = format(selectedNewDate, "yyyy-MM-dd");
      
      setAppointments(appointments.map(appointment => 
        appointment.id === selectedAppointment.id 
          ? { 
              ...appointment, 
              date: formattedDate, 
              time: selectedNewTime,
              status: "rescheduled" 
            } 
          : appointment
      ));
      
      toast({
        title: "Agendamento remarcado",
        description: `Nova data: ${format(selectedNewDate, "d 'de' MMMM", { locale: ptBR })} às ${selectedNewTime}.`
      });
    }
    
    setIsEditDialogOpen(false);
    setSelectedAppointment(null);
  };

  const viewClientDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsClientDetailsOpen(true);
  };

  // Renderizar badge de status
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Agendado</span>;
      case "confirmed":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Confirmado</span>;
      case "cancelled":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Cancelado</span>;
      case "rescheduled":
        return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Remarcado</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
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
                    <div key={appointment.id} className="border rounded-md p-4 flex flex-col space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            <h3 className="font-medium">{appointment.client}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{appointment.phone}</span>
                          </div>
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
                          {renderStatusBadge(appointment.status)}
                        </div>
                      </div>
                      
                      {/* Botões de ação */}
                      {appointment.status === "scheduled" && (
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600"
                            onClick={() => confirmAppointment(appointment.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-amber-600"
                            onClick={() => openRescheduleDialog(appointment)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Remarcar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600"
                            onClick={() => cancelAppointment(appointment)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => viewClientDetails(appointment)}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Dados do Cliente
                          </Button>
                        </div>
                      )}
                      
                      {appointment.status === "confirmed" && (
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-amber-600"
                            onClick={() => openRescheduleDialog(appointment)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Remarcar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600"
                            onClick={() => cancelAppointment(appointment)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => viewClientDetails(appointment)}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Dados do Cliente
                          </Button>
                        </div>
                      )}
                      
                      {(appointment.status === "cancelled" || appointment.status === "rescheduled") && (
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => viewClientDetails(appointment)}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Dados do Cliente
                          </Button>
                        </div>
                      )}
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

      {/* Dialog para remarcar agendamento */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remarcar Agendamento</DialogTitle>
            <DialogDescription>
              Selecione uma nova data e horário para o agendamento de {selectedAppointment?.client}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Nova Data</h4>
              <Calendar
                mode="single"
                selected={selectedNewDate}
                onSelect={setSelectedNewDate}
                locale={ptBR}
                disabled={(date) => date < new Date()}
                className="border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Novo Horário</h4>
              <Select 
                value={selectedNewTime} 
                onValueChange={setSelectedNewTime}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!selectedNewDate || !selectedNewTime}
            >
              Confirmar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para confirmar cancelamento */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o agendamento de {selectedAppointment?.client}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700">
              Cancelar Agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para visualizar detalhes do cliente */}
      <Dialog open={isClientDetailsOpen} onOpenChange={setIsClientDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas do cliente
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Nome</h4>
                <p>{selectedAppointment.client}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Telefone</h4>
                <p>{selectedAppointment.phone}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Email</h4>
                <p>{selectedAppointment.email}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Serviço</h4>
                <p>{getServiceName(selectedAppointment.serviceId)}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Data e Horário</h4>
                <p>{formatAppointmentDate(selectedAppointment.date)} às {selectedAppointment.time}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Status</h4>
                <div>{renderStatusBadge(selectedAppointment.status)}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setIsClientDetailsOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalDashboard;
