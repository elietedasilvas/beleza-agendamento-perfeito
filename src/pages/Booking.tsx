
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, User, ArrowRight, Info, CheckCircle, ScissorsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDuration,
  Professional,
  Service
} from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { Service as SupabaseService } from "@/types/global.d";
import { adaptToMockService } from "@/types/service-adapter";

const BookingPage = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  // Buscar profissionais e serviços do Supabase quando o componente for montado
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar profissionais
        const { data: professionalData, error: professionalError } = await supabase
          .from("professionals")
          .select("id, bio, active")
          .eq("active", true);
        
        if (professionalError) {
          console.error("Erro ao buscar profissionais:", professionalError);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os profissionais",
            variant: "destructive"
          });
          return;
        }
        
        // Buscar serviços
        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select("*")
          .eq("active", true);
        
        if (serviceError) {
          console.error("Erro ao buscar serviços:", serviceError);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os serviços",
            variant: "destructive"
          });
          return;
        }
        
        // Converter serviços de Supabase para o formato MockData
        const formattedServices = serviceData.map((service: SupabaseService) => 
          adaptToMockService(service)
        );
        
        // Buscar dados de perfil para cada profissional
        const enhancedProfessionals = await Promise.all(
          professionalData.map(async (prof) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("name, role, avatar_url")
              .eq("id", prof.id)
              .single();
            
            // Buscar serviços associados a este profissional
            const { data: professionalServices } = await supabase
              .from("professional_services")
              .select("service_id")
              .eq("professional_id", prof.id);
            
            const serviceIds = professionalServices ? 
              professionalServices.map(ps => ps.service_id) : [];
            
            return {
              id: prof.id,
              name: profileData?.name || "Profissional",
              role: profileData?.role || "professional",
              about: prof.bio || "Especialista em serviços de beleza",
              image: profileData?.avatar_url || "/placeholder.svg",
              services: serviceIds,
              rating: 5.0,
              reviewCount: 0,
              schedule: getDefaultSchedule()
            };
          })
        );
        
        setProfessionals(enhancedProfessionals);
        setServices(formattedServices);
        
        // Se tiver um ID de profissional na URL, selecionar ele
        if (professionalId) {
          const professional = enhancedProfessionals.find(p => p.id === professionalId);
          if (professional) {
            setSelectedProfessional(professional);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [professionalId]);
  
  // Função auxiliar para criar um cronograma padrão
  const getDefaultSchedule = () => {
    const schedule: Record<string, string[]> = {};
    const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
    
    diasSemana.forEach(dia => {
      schedule[dia] = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
    });
    
    return schedule;
  };
  
  const getAvailableProfessionals = (serviceId?: string) => {
    if (!serviceId) return professionals;
    return professionals.filter(p => p.services.includes(serviceId));
  };
  
  const getAvailableServices = (professionalId?: string) => {
    if (!professionalId) return services;
    const professional = professionals.find(p => p.id === professionalId);
    if (!professional) return [];
    return services.filter(service => professional.services.includes(service.id));
  };
  
  const availableProfessionals = selectedService
    ? getAvailableProfessionals(selectedService.id)
    : professionals;
  
  const availableServices = selectedProfessional
    ? getAvailableServices(selectedProfessional.id)
    : services;
  
  useEffect(() => {
    if (date && selectedProfessional) {
      const dayName = format(date, 'EEEE', { locale: ptBR });
      const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      
      const times = selectedProfessional.schedule[capitalizedDayName] || [];
      setAvailableTimes(times);
      setSelectedTime(null);
    } else {
      setAvailableTimes([]);
      setSelectedTime(null);
    }
  }, [date, selectedProfessional]);
  
  useEffect(() => {
    setSelectedService(null);
  }, [selectedProfessional]);
  
  const handleProfessionalChange = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId) || null;
    setSelectedProfessional(professional);
  };
  
  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId) || null;
    setSelectedService(service);
  };
  
  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);
  };
  
  const handleNextStep = () => {
    if (currentStep === 1 && (!selectedProfessional || !selectedService)) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione um profissional e um serviço.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === 2 && (!date || !selectedTime)) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione uma data e horário.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === 3) {
      setBookingComplete(true);
      return;
    }
    
    setCurrentStep(prevStep => prevStep + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };
  
  const handleFinish = () => {
    navigate("/");
  };
  
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Agende seu horário</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Escolha seu profissional, serviço, data e horário para agendar seu atendimento.
          </p>
          
          <div className="flex justify-center items-center mt-8 mb-10">
            <div className="flex items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                currentStep >= 1 ? 'bg-beauty-purple text-white' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <div className={`h-1 w-16 ${
                currentStep >= 2 ? 'bg-beauty-purple' : 'bg-muted'
              }`}></div>
            </div>
            <div className="flex items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                currentStep >= 2 ? 'bg-beauty-purple text-white' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <div className={`h-1 w-16 ${
                currentStep >= 3 ? 'bg-beauty-purple' : 'bg-muted'
              }`}></div>
            </div>
            <div className="flex items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                currentStep >= 3 ? 'bg-beauty-purple text-white' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <Card className="beauty-card">
            <CardContent className="flex justify-center items-center py-12">
              <p>Carregando dados de agendamento...</p>
            </CardContent>
          </Card>
        ) : !bookingComplete ? (
          <Card className="beauty-card">
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Escolha o profissional e serviço</CardTitle>
                  <CardDescription>
                    Selecione o profissional e o serviço desejado para o seu agendamento.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profissional</label>
                    <Select
                      value={selectedProfessional?.id || ""}
                      onValueChange={handleProfessionalChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProfessionals.map(professional => (
                          <SelectItem key={professional.id} value={professional.id}>
                            <div className="flex items-center">
                              <span>{professional.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({professional.role})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {professionals.length === 0 && (
                      <p className="text-sm text-red-500">Nenhum profissional encontrado no sistema.</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Serviço</label>
                    <Select
                      value={selectedService?.id || ""}
                      onValueChange={handleServiceChange}
                      disabled={!selectedProfessional}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          selectedProfessional 
                            ? "Selecione um serviço" 
                            : "Selecione um profissional primeiro"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableServices.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{service.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {formatCurrency(service.price)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedService && (
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">{selectedService.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {selectedService.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDuration(selectedService.duration)}</span>
                            </div>
                            <div className="font-medium text-beauty-purple">
                              {formatCurrency(selectedService.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            )}
            
            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Escolha a data e horário</CardTitle>
                  <CardDescription>
                    Selecione a data e horário disponíveis para o seu agendamento.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            
                            return date < today;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Horário</label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {availableTimes.length > 0 ? (
                        availableTimes.map(time => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className={
                              selectedTime === time 
                                ? "bg-beauty-purple hover:bg-beauty-purple/90" 
                                : ""
                            }
                            onClick={() => handleTimeSelection(time)}
                          >
                            {time}
                          </Button>
                        ))
                      ) : (
                        <div className="col-span-full text-center p-4 text-muted-foreground">
                          {date 
                            ? "Nenhum horário disponível para esta data."
                            : "Selecione uma data para ver os horários disponíveis."}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            )}
            
            {currentStep === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Confirme seu agendamento</CardTitle>
                  <CardDescription>
                    Verifique os detalhes do seu agendamento antes de confirmar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h3 className="font-medium text-lg mb-4">Resumo do agendamento</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Profissional</p>
                          <p className="font-medium">{selectedProfessional?.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedProfessional?.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <ScissorsIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Serviço</p>
                          <p className="font-medium">{selectedService?.name}</p>
                          <p className="text-sm text-muted-foreground">{formatDuration(selectedService?.duration || 0)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Data e horário</p>
                          <p className="font-medium">
                            {date && format(date, "PPP", { locale: ptBR })}
                          </p>
                          <p className="text-sm text-muted-foreground">{selectedTime}</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">Valor total:</p>
                          <p className="font-bold text-beauty-purple text-lg">
                            {formatCurrency(selectedService?.price || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
            
            <CardFooter className="flex justify-between">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handlePrevStep}>
                  Voltar
                </Button>
              ) : (
                <div></div>
              )}
              
              <Button onClick={handleNextStep} className="beauty-button">
                {currentStep < 3 ? (
                  <>
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Confirmar Agendamento"
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="beauty-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 bg-beauty-light p-3 rounded-full inline-flex">
                <CheckCircle className="h-12 w-12 text-beauty-purple" />
              </div>
              <CardTitle className="text-2xl">Agendamento Confirmado!</CardTitle>
              <CardDescription>
                Seu agendamento foi realizado com sucesso.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-muted/50 p-4 rounded-md mx-auto max-w-md">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Profissional</p>
                    <p className="font-medium">{selectedProfessional?.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Serviço</p>
                    <p className="font-medium">{selectedService?.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Data e horário</p>
                    <p className="font-medium">
                      {date && format(date, "PPP", { locale: ptBR })} às {selectedTime}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground">
                Você receberá uma confirmação por e-mail com os detalhes do agendamento.
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={handleFinish} className="beauty-button">
                Voltar para Home
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
