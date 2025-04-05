import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star, Clock, CalendarDays, BadgeCheck, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { services as originalServices, professionals, formatCurrency, formatDuration } from "@/data/mockData";

const getServices = () => {
  return window.updatedServices || originalServices;
};

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 beauty-gradient opacity-90 z-0"></div>
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80')" }}
      ></div>
      
      <div className="container relative z-10 py-20 md:py-32 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Agende seu momento de beleza e bem-estar
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Reserve serviços de estética e barbearia com os melhores profissionais da cidade
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="beauty-button bg-white text-beauty-purple hover:bg-gray-100">
              <Link to="/booking">
                <CalendarDays className="mr-2 h-4 w-4" />
                Agendar Agora
              </Link>
            </Button>
            <Button asChild variant="outline" className="beauty-button border-white text-white hover:bg-white/10">
              <Link to="/professionals">
                <BadgeCheck className="mr-2 h-4 w-4" />
                Ver Profissionais
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceSection = () => {
  const categories = [
    { id: "all", name: "Todos" },
    { id: "hair", name: "Cabelo" },
    { id: "face", name: "Facial" },
    { id: "body", name: "Corporal" },
    { id: "barber", name: "Barbearia" },
  ];
  
  const [activeCategory, setActiveCategory] = useState("all");
  
  const currentServices = getServices();
  const filteredServices = activeCategory === "all" 
    ? currentServices 
    : currentServices.filter(service => service.category === activeCategory);
  
  return (
    <section className="py-16 bg-beauty-light/50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Nossos Serviços</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Descubra nossa variedade de serviços de beleza e bem-estar, todos realizados por profissionais qualificados.
          </p>
        </div>
        
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="data-[state=active]:bg-beauty-purple data-[state=active]:text-white">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value={activeCategory} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.map(service => (
                <Card key={service.id} className="beauty-card overflow-hidden group cursor-pointer">
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm text-muted-foreground">{formatDuration(service.duration)}</span>
                      </div>
                      <p className="font-semibold text-beauty-purple">{formatCurrency(service.price)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Button asChild className="beauty-button">
                <Link to="/booking">
                  Ver Todos os Serviços
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

const ProfessionalsSection = () => {
  const featuredProfessionals = professionals.slice(0, 4);
  
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Nossos Especialistas</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Conheça os profissionais que farão você se sentir especial com atendimento personalizado.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProfessionals.map(professional => (
            <Card key={professional.id} className="beauty-card relative group overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={professional.image} 
                  alt={professional.name} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-lg mb-1">{professional.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{professional.role}</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{professional.rating}</span>
                  <span className="text-xs text-muted-foreground">({professional.reviewCount} avaliações)</span>
                </div>
                <Button asChild variant="outline" className="w-full beauty-button">
                  <Link to={`/booking/${professional.id}`}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Agendar
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button asChild className="beauty-button">
            <Link to="/professionals">
              Ver Todos os Profissionais
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <CalendarDays className="h-12 w-12 text-beauty-purple" />,
      title: "Agendamento Fácil",
      description: "Marque seus horários rapidamente, sem complicações ou espera por atendimento."
    },
    {
      icon: <Scissors className="h-12 w-12 text-beauty-purple" />,
      title: "Profissionais Qualificados",
      description: "Nossa equipe é composta por especialistas experientes em suas áreas."
    },
    {
      icon: <BadgeCheck className="h-12 w-12 text-beauty-purple" />,
      title: "Serviços Premium",
      description: "Utilizamos produtos de alta qualidade para garantir os melhores resultados."
    },
    {
      icon: <Clock className="h-12 w-12 text-beauty-purple" />,
      title: "Horários Flexíveis",
      description: "Disponibilidade estendida para atender você quando for mais conveniente."
    }
  ];
  
  return (
    <section className="py-16 bg-gradient-to-b from-beauty-peach/50 to-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Por que nos escolher?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Oferecemos experiências de beleza e bem-estar de alta qualidade, com atendimento personalizado.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="mb-4 inline-flex items-center justify-center p-3 bg-beauty-light rounded-full">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Mariana Souza",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      quote: "Atendimento impecável! A Ana é maravilhosa, super profissional e atenciosa. Minha pele nunca esteve tão bonita!",
      rating: 5
    },
    {
      name: "João Pedro",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      quote: "O Carlos é o melhor barbeiro que já conheci. Corte perfeito e a barba também. Sempre saio satisfeito!",
      rating: 5
    },
    {
      name: "Camila Alves",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      quote: "Excelente experiência! A massagem do Roberto é simplesmente incrível, saí totalmente relaxada e renovada.",
      rating: 5
    }
  ];
  
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">O que nossos clientes dizem</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Confira a opinião de quem já experimentou nossos serviços.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="beauty-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-16 beauty-gradient">
      <div className="container text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Pronto para agendar seu próximo momento de beleza?
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Escolha entre nossos diversos serviços e profissionais qualificados para uma experiência única.
        </p>
        <Button asChild className="beauty-button bg-white text-beauty-purple hover:bg-gray-100">
          <Link to="/booking">
            <CalendarDays className="mr-2 h-4 w-4" />
            Agendar Agora
          </Link>
        </Button>
      </div>
    </section>
  );
};

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <ServiceSection />
      <ProfessionalsSection />
      <FeaturesSection />
      <TestimonialSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
