import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Scissors, Clock } from "lucide-react";
import { formatCurrency, formatDuration } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [servicesDuration, setServicesDuration] = useState(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Calcular datas para filtrar agendamentos da semana atual
  const now = new Date();
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });
  const formattedStartDate = format(startOfCurrentWeek, 'yyyy-MM-dd');
  const formattedEndDate = format(endOfCurrentWeek, 'yyyy-MM-dd');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Buscar serviços
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('active', true);
          
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
        
        // Calcular duração média dos serviços
        if (servicesData && servicesData.length > 0) {
          const totalDuration = servicesData.reduce((acc, service) => acc + service.duration, 0);
          setServicesDuration(Math.round(totalDuration / servicesData.length));
        }
        
        // Buscar profissionais
        const { data: professionalsData, error: professionalsError } = await supabase
          .from('professionals')
          .select('id, active')
          .eq('active', true);
          
        if (professionalsError) throw professionalsError;
        
        // Buscar detalhes dos perfis dos profissionais
        const professionalList = await Promise.all(
          (professionalsData || []).map(async (p) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('id', p.id)
              .single();
            
            return {
              id: p.id,
              name: profileData?.name || 'Sem nome',
              image: profileData?.avatar_url || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
              // Valores padrão para evitar erros
              role: 'Profissional',
              rating: 5.0,
              reviewCount: 0
            };
          })
        );
        
        setProfessionals(professionalList);
        
        // Buscar todos os agendamentos
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            date,
            start_time,
            status,
            professional_id,
            service_id,
            client_id
          `)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true });
          
        if (appointmentsError) throw appointmentsError;
        
        // Buscar detalhes para cada agendamento
        const appointmentsWithDetails = await Promise.all(
          (appointmentsData || []).map(async (apt) => {
            // Buscar dados do cliente
            const { data: clientData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', apt.client_id)
              .single();
            
            // Buscar dados do profissional
            const { data: professionalData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', apt.professional_id)
              .single();
            
            // Buscar dados do serviço
            const { data: serviceData } = await supabase
              .from('services')
              .select('name')
              .eq('id', apt.service_id)
              .single();
            
            return {
              ...apt,
              client_name: clientData?.name || 'Cliente não encontrado',
              professional_name: professionalData?.name || 'Profissional não encontrado',
              service_name: serviceData?.name || 'Serviço não encontrado'
            };
          })
        );
        
        setAppointments(appointmentsWithDetails);
        
        // Buscar próximos agendamentos
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('appointments')
          .select(`
            id,
            date,
            start_time,
            status,
            professional_id,
            service_id,
            client_id
          `)
          .gte('date', format(new Date(), 'yyyy-MM-dd'))
          .order('date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(3);
          
        if (upcomingError) throw upcomingError;
        
        // Adicionar detalhes aos próximos agendamentos
        const upcomingWithDetails = await Promise.all(
          (upcomingData || []).map(async (apt) => {
            // Buscar dados do cliente
            const { data: clientData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', apt.client_id)
              .single();
            
            // Buscar dados do profissional
            const { data: professionalData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', apt.professional_id)
              .single();
            
            // Buscar dados do serviço
            const { data: serviceData } = await supabase
              .from('services')
              .select('name')
              .eq('id', apt.service_id)
              .single();
            
            return {
              ...apt,
              client_name: clientData?.name || 'Cliente não encontrado',
              professional_name: professionalData?.name || 'Profissional não encontrado',
              service_name: serviceData?.name || 'Serviço não encontrado'
            };
          })
        );
        
        setUpcomingAppointments(upcomingWithDetails);
        
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Configurar inscrição de tempo real para atualizações
    const appointmentsChannel = supabase
      .channel('public:appointments')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'appointments' 
      }, () => {
        // Recarregar dados quando houver alterações
        fetchDashboardData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(appointmentsChannel);
    };
  }, [toast]);
  
  // Calcular número de agendamentos para a semana atual
  const currentWeekAppointments = appointments.filter(apt => {
    return apt.date >= formattedStartDate && apt.date <= formattedEndDate;
  });
  
  // Calcular avaliação média dos profissionais (usando dados mockados por enquanto)
  const averageRating = professionals.length 
    ? (professionals.reduce((sum, pro) => sum + (pro.rating || 5), 0) / professionals.length).toFixed(1)
    : "5.0";
  
  // Calcular valor total dos serviços cadastrados
  const totalServicesValue = services.reduce((total, service) => total + Number(service.price), 0);
  
  // Função para formatar data de agendamento
  const formatAppointmentDate = (dateString: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (dateString === today) {
      return 'Hoje';
    }
    
    return format(new Date(dateString), 'd MMM', { locale: ptBR });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-playfair font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao portal administrativo.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Serviços
            </CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalServicesValue)} em serviços cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Profissionais
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professionals.length}</div>
            <p className="text-xs text-muted-foreground">
              {averageRating}/5.0 de avaliação média
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Agendamentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {currentWeekAppointments.length} agendamentos para esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Tempo Médio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(servicesDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Duração média dos serviços
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>Agendamentos para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <Calendar className="h-8 w-8 animate-pulse text-muted-foreground" />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum agendamento próximo encontrado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center gap-4 p-3 rounded-md border">
                    <div className="rounded-full w-2 h-2 bg-primary"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {appointment.client_name || 'Cliente'} • {appointment.service_name || 'Serviço'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Com {appointment.professional_name || 'Profissional'}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatAppointmentDate(appointment.date)}, {appointment.start_time.substring(0, 5)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Profissionais Populares</CardTitle>
            <CardDescription>Profissionais mais agendados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <Users className="h-8 w-8 animate-pulse text-muted-foreground" />
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum profissional encontrado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {professionals.slice(0, 3).map((pro) => (
                  <div key={pro.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pro.name}</p>
                      <p className="text-sm text-muted-foreground">{pro.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{pro.rating.toFixed(1)}</span>
                      <span className="text-yellow-400">★</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
