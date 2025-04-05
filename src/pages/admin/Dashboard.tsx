
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Scissors, Clock } from "lucide-react";
import { professionals, services, formatCurrency } from "@/data/mockData";

const AdminDashboard = () => {
  const totalServices = services.length;
  const totalProfessionals = professionals.length;
  const totalAppointments = 24; // Mock data
  const averageRating = (professionals.reduce((sum, pro) => sum + pro.rating, 0) / professionals.length).toFixed(1);
  
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
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {services.reduce((total, service) => total + service.price, 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })} em serviços cadastrados
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
            <div className="text-2xl font-bold">{totalProfessionals}</div>
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
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              15 agendamentos para esta semana
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
            <div className="text-2xl font-bold">45min</div>
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
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-md border">
                  <div className="rounded-full w-2 h-2 bg-primary"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Ana Silva • Corte de Cabelo</p>
                    <p className="text-sm text-muted-foreground">Com Juliana Costa</p>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-nowrap">Hoje, 14:00</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Profissionais Populares</CardTitle>
            <CardDescription>Profissionais mais agendados</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <span className="font-medium">{pro.rating}</span>
                    <span className="text-yellow-400">★</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
