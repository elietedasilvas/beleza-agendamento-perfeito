
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, CalendarDays, Scissors, Spa, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { professionals, services, getServicesByProfessional } from "@/data/mockData";

const ProfessionalsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // Filter professionals based on search term and selected services
  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         professional.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesServices = selectedServices.length === 0 || 
                           professional.services.some(serviceId => 
                             selectedServices.includes(serviceId));
    
    return matchesSearch && matchesServices;
  });
  
  const toggleServiceFilter = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof services>);
  
  const categoryIcons = {
    hair: <Scissors className="h-4 w-4" />,
    face: <UserCheck className="h-4 w-4" />,
    body: <Spa className="h-4 w-4" />,
    barber: <Scissors className="h-4 w-4" />
  };
  
  const categoryNames = {
    hair: "Cabelo",
    face: "Facial",
    body: "Corporal",
    barber: "Barbearia"
  };
  
  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Nossos Profissionais</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Conheça nossa equipe de especialistas em beleza e bem-estar, prontos para lhe atender.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <Card className="beauty-card sticky top-20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Filtros</h2>
              
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar profissionais..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Accordion type="multiple" defaultValue={["services"]} className="w-full">
                <AccordionItem value="services">
                  <AccordionTrigger className="text-base font-medium">Serviços</AccordionTrigger>
                  <AccordionContent>
                    {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                      <div key={category} className="mb-4">
                        <h3 className="text-sm font-semibold mb-2 flex items-center">
                          {categoryIcons[category as keyof typeof categoryIcons]}
                          <span className="ml-2">{categoryNames[category as keyof typeof categoryNames]}</span>
                        </h3>
                        <div className="space-y-2">
                          {categoryServices.map(service => (
                            <div key={service.id} className="flex items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start px-1 py-1 ${
                                  selectedServices.includes(service.id) 
                                    ? 'text-beauty-purple font-medium' 
                                    : 'text-muted-foreground'
                                }`}
                                onClick={() => toggleServiceFilter(service.id)}
                              >
                                <span className="truncate">{service.name}</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {selectedServices.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedServices.map(serviceId => {
                    const service = services.find(s => s.id === serviceId);
                    return service ? (
                      <Badge 
                        key={serviceId}
                        variant="outline"
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => toggleServiceFilter(serviceId)}
                      >
                        {service.name}
                        <span className="ml-1">×</span>
                      </Badge>
                    ) : null;
                  })}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-auto py-1"
                    onClick={() => setSelectedServices([])}
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Professionals grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProfessionals.length > 0 ? (
              filteredProfessionals.map(professional => {
                const proServices = getServicesByProfessional(professional.id);
                
                return (
                  <Card key={professional.id} className="beauty-card overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={professional.image} 
                        alt={professional.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{professional.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{professional.role}</p>
                      
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{professional.rating}</span>
                        <span className="text-xs text-muted-foreground">({professional.reviewCount} avaliações)</span>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Serviços:</h4>
                        <div className="flex flex-wrap gap-1">
                          {proServices.slice(0, 3).map(service => (
                            <Badge key={service.id} variant="outline" className="text-xs">
                              {service.name}
                            </Badge>
                          ))}
                          {proServices.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{proServices.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="about">
                          <AccordionTrigger className="text-sm py-2">Sobre</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground">
                              {professional.about}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      
                      <Button asChild className="w-full mt-4 beauty-button">
                        <Link to={`/booking/${professional.id}`}>
                          <CalendarDays className="mr-2 h-4 w-4" />
                          Agendar
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhum profissional encontrado para os filtros selecionados.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedServices([]);
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalsPage;
