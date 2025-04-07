import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  Clock,
  Calendar as CalendarIcon,
  XCircle,
  Filter,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import ProfessionalSelector from "@/components/admin/professionals/ProfessionalSelector";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define appointment type
type Appointment = {
  id: string;
  client_id: string;
  service_id: string;
  professional_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;

  // For UI display, populated after fetching
  client_name?: string;
  client_phone?: string;
  service_name?: string;
  professional_name?: string;
};

const AppointmentsAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");

  // Function to format date for display
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };

  // Function to fetch appointments from Supabase
  const fetchAppointments = async () => {
    let query = supabase
      .from("appointments")
      .select(`
        *,
        services:service_id (name),
        professionals:professional_id (id)
      `);

    // Apply date filter if specified
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      query = query.eq("date", formattedDate);
    }

    // Apply status filter if not "all"
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    // Apply professional filter if not "all"
    if (professionalFilter !== "all") {
      query = query.eq("professional_id", professionalFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Fetch client details and professional names for each appointment
    const appointmentsWithDetails = await Promise.all(
      (data || []).map(async (appointment) => {
        // Fetch client details
        const { data: clientData } = await supabase
          .from("profiles")
          .select("name, phone")
          .eq("id", appointment.client_id)
          .single();

        // Fetch professional name
        const { data: professionalData } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", appointment.professional_id)
          .single();

        return {
          ...appointment,
          client_name: clientData?.name || "Cliente não encontrado",
          client_phone: clientData?.phone || "Telefone não cadastrado",
          service_name: appointment.services?.name || "Serviço não encontrado",
          professional_name: professionalData?.name || "Profissional não encontrado",
          // Garantir que o status sempre tenha um valor padrão
          status: appointment.status || "scheduled"
        };
      })
    );

    return appointmentsWithDetails;
  };

  // Query to fetch appointments
  const { data: appointments, isLoading, error, refetch } = useQuery({
    queryKey: ["appointments", date, statusFilter, professionalFilter],
    queryFn: fetchAppointments,
  });

  // Set up real-time subscription for appointments
  useEffect(() => {
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          // Refetch appointments when changes occur
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Query to fetch professionals
  const { data: professionals, isLoading: isLoadingProfessionals } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("id")
        .eq("active", true);

      if (error) throw error;

      // Fetch professional names separately
      const professionalsWithNames = await Promise.all(
        (data || []).map(async (pro) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", pro.id)
            .single();

          return {
            id: pro.id,
            name: profileData?.name || "Nome não encontrado"
          };
        })
      );

      return professionalsWithNames;
    }
  });

  // Mutation to update appointment status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Status atualizado",
        description: "O status do agendamento foi atualizado com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: `Não foi possível atualizar o status: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Function to update appointment status
  const updateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Agendado</span>;
      case "completed":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Concluído</span>;
      case "canceled":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Cancelado</span>;
      default:
        return null;
    }
  };

  // Handle professional change
  const handleProfessionalChange = (professionalId: string) => {
    setProfessionalFilter(professionalId);
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
              <SelectItem value="canceled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          {isLoadingProfessionals ? (
            <Select disabled>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando...</span>
                </div>
              </SelectTrigger>
            </Select>
          ) : (
            <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Profissionais</SelectItem>
                {professionals?.map(pro => (
                  <SelectItem key={pro.id} value={pro.id}>{pro.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Carregando agendamentos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-destructive">
                  Erro ao carregar agendamentos: {(error as Error).message}
                </TableCell>
              </TableRow>
            ) : appointments && appointments.length > 0 ? (
              appointments.map(appointment => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{appointment.client_name}</p>
                      <p className="text-xs text-muted-foreground">{appointment.client_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.service_name}</TableCell>
                  <TableCell>{appointment.professional_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-sm">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatAppointmentDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.start_time.substring(0, 5)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(appointment.status || "scheduled")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {(appointment.status === "scheduled" || !appointment.status) && (
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
                            onClick={() => updateStatus(appointment.id, "canceled")}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      )}
                      {appointment.status === "completed" && (
                        <span className="text-xs text-muted-foreground italic">Concluído</span>
                      )}
                      {appointment.status === "canceled" && (
                        <span className="text-xs text-muted-foreground italic">Cancelado</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
