import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star, Clock, CalendarDays, BadgeCheck, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDuration } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/global.d";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";

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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("active", true);

        if (error) {
          console.error("Error fetching services:", error);
          return;
        }

        if (data) {
          setServices(data as Service[]);
          window.updatedServices = data as Service[];
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const filteredServices = activeCategory === "all"
    ? services
    : services.filter(service => service.category === activeCategory);

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
            {loading ? (
              <div className="text-center py-12">Carregando serviços...</div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum serviço encontrado nesta categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredServices.map(service => (
                  <Card key={service.id} className="beauty-card overflow-hidden group cursor-pointer">
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={service.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80';
                        }}
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
            )}

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
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfessionals() {
      try {
        setLoading(true);

        const { data: professionalData, error: professionalError } = await supabase
          .from("professionals")
          .select("id, bio, active")
          .eq("active", true)
          .limit(4);

        if (professionalError) {
          console.error("Error fetching professionals:", professionalError);
          return;
        }

        if (!professionalData || professionalData.length === 0) {
          setLoading(false);
          return;
        }

        const enhancedProfessionals = await Promise.all(
          professionalData.map(async (prof) => {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("name, avatar_url")
              .eq("id", prof.id)
              .single();

            if (profileError) {
              console.error(`Error fetching profile for professional ${prof.id}:`, profileError);
            }

            return {
              id: prof.id,
              name: profileData?.name || "Profissional",
              image: profileData?.avatar_url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
              bio: prof.bio || "Especialista em beleza e bem-estar",
              role: "Profissional",
              rating: 5.0,
              reviewCount: 0,
              active: prof.active
            };
          })
        );

        setProfessionals(enhancedProfessionals);
      } catch (error) {
        console.error("Error in ProfessionalsSection:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfessionals();
  }, []);

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Nossos Especialistas</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Conheça os profissionais que farão você se sentir especial com atendimento personalizado.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Carregando profissionais...</div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum profissional encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {professionals.map(professional => (
              <Card key={professional.id} className="beauty-card relative group overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={professional.image}
                    alt={professional.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80';
                    }}
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
        )}

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
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">O que nossos clientes dizem</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Confira a opinião de quem já experimentou nossos serviços.
          </p>
        </div>

        <ReviewsCarousel />
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
