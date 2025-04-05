
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CheckCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  XCircle,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { professionals, services, getServicesByProfessional } from "@/data/mockData";

// Simulate appointments data
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
    id: "2",
    serviceId: "2",
    professionalId: "2",
    client: "João Silva",
    phone: "(11) 91234-5678",
    date: "2025-04-10",
    time: "10:00",
    status: "completed"
  },
  {
    id: "3",
    serviceId: "3",
    professionalId: "1",
    client: "Ana Beatriz",
    phone: "(11) 99876-5432",
    date: "2025-04-12",
    time: "15:00",
    status: "scheduled"
  },
  {
    id: "4",
    serviceId: "4",
    professionalId: "4",
    client: "Carlos Eduardo",
    phone: "(11) 94567-8901",
    date: "2025-04-11",
    time: "11:00",
    status: "cancelled"
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
  }
];

const AppointmentsAdmin = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");
  const [appointments, setAppointments] = useState(mockAppointments);
  
  // Function to format date for display
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };
  
  // Filter appointments based on selected filters
  const filteredAppointments = appointments.filter(appointment => {
    // Filter by date
    if (date) {
      const appointmentDate = new Date(appointment.date);
      const selectedDate = new Date(date);
      
      if (appointmentDate.toDateString() !== selectedDate.toDateString()) {
        return false;
      }
    }
    
    // Filter by status
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }
    
    // Filter by professional
    if (professionalFilter !== "all" && appointment.professionalId !== professionalFilter) {
      return false;
    }
    
    return true;
  });
  
  // Get service and professional info
  const getAppointmentDetails = (appointment: (typeof mockAppointments)[0]) => {
    const service = services.find(s => s.id === appointment.serviceId);
    const professional = professionals.find(p => p.id === appointment.professionalId);
    
    return {
      service: service?.name || "Serviço não encontrado",
      professional: professional?.name || "Profissional não encontrado"
    };
  };
  
  // Update appointment status
  const updateStatus = (id: string, newStatus: string) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === id ? { ...appointment, status: newStatus } : appointment
    ));
  };
  
  // Status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Agendado</span>;
      case "completed":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Concluído</span>;
      case "cancelled":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Cancelado</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-playfair font-bold">Gerenciar Agendamentos</h1>
        <p className="text-muted-foreground">Visualize e gerencie todos os agendamentos.</p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center border p-4 rounded-md bg-muted/20">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <div className="w-48">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "d 'de' MMMM", { locale: ptBR }) : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="w-40">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="scheduled">Agendados</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-48">
          <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Profissionais</SelectItem>
              {professionals.map(pro => (
                <SelectItem key={pro.id} value={pro.id}>{pro.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {date && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDate(undefined)}
            className="h-8"
          >
            Limpar data
          </Button>
        )}
      </div>
      
      {/* Appointments Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Data e Hora</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(appointment => {
                const { service, professional } = getAppointmentDetails(appointment);
                return (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.client}</p>
                        <p className="text-xs text-muted-foreground">{appointment.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{service}</TableCell>
                    <TableCell>{professional}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatAppointmentDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {appointment.status === "scheduled" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs text-green-600"
                              onClick={() => updateStatus(appointment.id, "completed")}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Concluir
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs text-red-600"
                              onClick={() => updateStatus(appointment.id, "cancelled")}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                        {appointment.status === "completed" && (
                          <span className="text-xs text-muted-foreground italic">Concluído</span>
                        )}
                        {appointment.status === "cancelled" && (
                          <span className="text-xs text-muted-foreground italic">Cancelado</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Não foram encontrados agendamentos com os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AppointmentsAdmin;
