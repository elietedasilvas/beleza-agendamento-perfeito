import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Rating } from "@/components/ui/rating";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  client: {
    name: string;
  };
  professional: {
    name: string;
  };
  service: {
    name: string;
  };
}

export function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Buscar avaliações aprovadas
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Buscar avaliações aprovadas
        const { data, error } = await supabase
          .from("reviews")
          .select(`
            id,
            rating,
            comment,
            client_id,
            professional_id,
            appointment:appointment_id(service:service_id(name))
          `)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        // Buscar informações dos clientes e profissionais
        const clientIds = data.map((review: any) => review.client_id);
        const professionalIds = data.map((review: any) => review.professional_id);
        const allUserIds = [...new Set([...clientIds, ...professionalIds])];

        // Buscar perfis de usuários
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", allUserIds);

        if (profilesError) throw profilesError;

        // Criar mapa de id -> nome
        const userNamesMap: Record<string, string> = {};
        profilesData?.forEach((profile: any) => {
          userNamesMap[profile.id] = profile.name;
        });

        // Formatar os dados
        const formattedReviews = data.map((review: any) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          client: {
            name: userNamesMap[review.client_id] || "Cliente",
          },
          professional: {
            name: userNamesMap[review.professional_id] || "Profissional",
          },
          service: {
            name: review.appointment?.service?.name || "Serviço",
          },
        }));

        setReviews(formattedReviews);
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Navegar para a próxima avaliação
  const nextReview = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Navegar para a avaliação anterior
  const prevReview = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  // Obter iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Carregando avaliações...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null; // Não mostrar nada se não houver avaliações
  }

  const currentReview = reviews[currentIndex];

  return (
    <div className="relative py-10">
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <Quote className="h-10 w-10 text-primary/30 mb-4" />

              {currentReview.comment && (
                <p className="text-lg mb-6 italic">"{currentReview.comment}"</p>
              )}

              <div className="mb-4">
                <Rating value={currentReview.rating} readOnly />
              </div>

              <div className="flex flex-col items-center">
                <Avatar className="h-12 w-12 mb-2">
                  <AvatarFallback>{getInitials(currentReview.client.name)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{currentReview.client.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentReview.service.name} com {currentReview.professional.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {reviews.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={prevReview}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={nextReview}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
