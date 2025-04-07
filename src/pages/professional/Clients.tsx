
import { useState, useEffect } from "react";
import { useProfessionalAuth } from "@/contexts/ProfessionalAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, Mail, Calendar, MoreVertical, Search, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock appointments data (would come from a real API/database)
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
  },
  {
    id: "7",
    serviceId: "1",
    professionalId: "3",
    client: "João Silva",
    phone: "(11) 99876-5432",
    email: "joao.silva@example.com",
    date: "2025-03-20",
    time: "10:00",
    status: "completed"
  },
  {
    id: "8",
    serviceId: "5",
    professionalId: "3",
    client: "Carlos Oliveira",
    phone: "(11) 95432-1098",
    email: "carlos.oliveira@example.com",
    date: "2025-03-25",
    time: "15:30",
    status: "completed"
  },
  {
    id: "9",
    serviceId: "8",
    professionalId: "1",
    client: "Maria Fernandes",
    phone: "(11) 98765-4321",
    email: "maria.fernandes@example.com",
    date: "2025-04-12",
    time: "11:00",
    status: "scheduled"
  }
];

interface Client {
  name: string;
  email: string;
  phone: string;
  appointments: number;
  lastAppointment: string;
}

const ProfessionalClients = () => {
  const { professionalAuth } = useProfessionalAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Process appointments to get unique clients for this professional
  useEffect(() => {
    if (professionalAuth?.id) {
      // Get all appointments for this professional
      const professionalAppointments = mockAppointments.filter(
        appointment => appointment.professionalId === professionalAuth.id
      );

      // Create a map to store unique clients and their appointment details
      const clientsMap = new Map<string, Client>();

      professionalAppointments.forEach(appointment => {
        const { client, email, phone, date } = appointment;
        
        // If client already exists in map, update appointment count and date if newer
        if (clientsMap.has(email)) {
          const existingClient = clientsMap.get(email)!;
          const existingDate = new Date(existingClient.lastAppointment);
          const appointmentDate = new Date(date);
          
          clientsMap.set(email, {
            ...existingClient,
            appointments: existingClient.appointments + 1,
            lastAppointment: appointmentDate > existingDate ? date : existingClient.lastAppointment
          });
        } else {
          // Add new client to map
          clientsMap.set(email, {
            name: client,
            email,
            phone,
            appointments: 1,
            lastAppointment: date
          });
        }
      });

      // Convert map to array
      setClients(Array.from(clientsMap.values()));
    }
  }, [professionalAuth?.id]);

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleViewClientDetails = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailsOpen(true);
  };

  const handleSendMessage = (client: Client) => {
    toast({
      title: "Mensagem enviada",
      description: `Uma mensagem foi enviada para ${client.name}.`,
    });
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-playfair font-bold">Seus Clientes</h1>
        <p className="text-muted-foreground">
          Gerencie e visualize informações dos clientes que já agendaram com você
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Lista de Clientes</CardTitle>
          <CardDescription>
            {clients.length} clientes registrados
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, email ou telefone..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredClients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Agendamentos</TableHead>
                  <TableHead>Último Agendamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.email}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm flex items-center">
                          <Phone className="h-3 w-3 mr-1" /> {client.phone}
                        </span>
                        <span className="text-sm flex items-center">
                          <Mail className="h-3 w-3 mr-1" /> {client.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{client.appointments}</TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {formatDate(client.lastAppointment)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewClientDetails(client)}>
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendMessage(client)}>
                            Enviar mensagem
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? "Nenhum cliente encontrado para esta busca." 
                : "Você ainda não tem clientes registrados."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for client details */}
      <Dialog open={isClientDetailsOpen} onOpenChange={setIsClientDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas do cliente
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedClient.name}</h3>
                  <p className="text-sm text-muted-foreground">Cliente desde {formatDate(selectedClient.lastAppointment)}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{selectedClient.phone}</span>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{selectedClient.email}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Último agendamento: {formatDate(selectedClient.lastAppointment)}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">Histórico de Agendamentos</p>
                <p className="text-sm text-muted-foreground">
                  {selectedClient.appointments} agendamento(s) realizados
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => handleSendMessage(selectedClient!)}
            >
              Enviar Mensagem
            </Button>
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

export default ProfessionalClients;
