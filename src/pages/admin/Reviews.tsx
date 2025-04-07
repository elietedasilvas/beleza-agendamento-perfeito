import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
  client: {
    name: string;
  };
  professional: {
    name: string;
  };
  appointment: {
    service: {
      name: string;
    };
  };
}

const ReviewsAdminPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar avaliações
  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Buscar as avaliações
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          status,
          created_at,
          updated_at,
          client_id,
          professional_id,
          appointment_id,
          appointment:appointment_id(service:service_id(name))
        `)
        .order("created_at", { ascending: false });

      // Garantir que todas as avaliações tenham um status definido
      const reviewsWithStatus = data?.map((review: any) => ({
        ...review,
        status: review.status || "pending"
      })) || [];

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
      const formattedReviews = reviewsWithStatus.map((review: any) => ({
        ...review,
        client: {
          name: userNamesMap[review.client_id] || "Cliente",
        },
        professional: {
          name: userNamesMap[review.professional_id] || "Profissional",
        },
        appointment: {
          service: {
            name: review.appointment?.service?.name || "Serviço",
          },
        },
      }));

      console.log('Avaliações formatadas:', formattedReviews);
      setReviews(formattedReviews);
    } catch (error: any) {
      console.error("Erro ao buscar avaliações:", error);
      toast({
        title: "Erro ao carregar avaliações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Aprovar avaliação
  const handleApproveReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Atualizar a lista localmente
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id ? { ...review, status: "approved" } : review
        )
      );

      toast({
        title: "Avaliação aprovada",
        description: "A avaliação foi aprovada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao aprovar avaliação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Rejeitar avaliação
  const handleRejectReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Atualizar a lista localmente
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id ? { ...review, status: "rejected" } : review
        )
      );

      toast({
        title: "Avaliação rejeitada",
        description: "A avaliação foi rejeitada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao rejeitar avaliação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Filtrar avaliações por status
  const pendingReviews = reviews.filter((review) => review.status === "pending");
  const approvedReviews = reviews.filter(
    (review) => review.status === "approved"
  );
  const rejectedReviews = reviews.filter(
    (review) => review.status === "rejected"
  );

  // Renderizar tabela de avaliações
  const renderReviewsTable = (reviewsList: Review[]) => {
    return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Profissional</TableHead>
          <TableHead>Serviço</TableHead>
          <TableHead>Avaliação</TableHead>
          <TableHead>Comentário</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reviewsList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-4">
              Nenhuma avaliação encontrada.
            </TableCell>
          </TableRow>
        ) : (
          reviewsList.map((review) => (
            <TableRow key={review.id}>
              <TableCell>
                {new Date(review.created_at).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell>{review.client.name}</TableCell>
              <TableCell>{review.professional.name}</TableCell>
              <TableCell>{review.appointment.service.name}</TableCell>
              <TableCell>
                <Rating value={review.rating} readOnly size="sm" />
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {review.comment || "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    review.status === "approved"
                      ? "success"
                      : review.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {review.status === "approved"
                    ? "Aprovada"
                    : review.status === "rejected"
                    ? "Rejeitada"
                    : "Pendente"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {/* Mostrar botões de ação para todas as avaliações */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600"
                    onClick={() => handleApproveReview(review.id)}
                    disabled={review.status === "approved"}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleRejectReview(review.id)}
                    disabled={review.status === "rejected"}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Avaliações</h1>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="relative">
            Pendentes
            {pendingReviews.length > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                {pendingReviews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Avaliações</CardTitle>
            <CardDescription>
              Gerencie as avaliações dos clientes sobre os serviços.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Carregando avaliações...</p>
              </div>
            ) : (
              <>
                <TabsContent value="pending">
                  {renderReviewsTable(pendingReviews)}
                </TabsContent>
                <TabsContent value="approved">
                  {renderReviewsTable(approvedReviews)}
                </TabsContent>
                <TabsContent value="rejected">
                  {renderReviewsTable(rejectedReviews)}
                </TabsContent>
                <TabsContent value="all">{renderReviewsTable(reviews)}</TabsContent>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default ReviewsAdminPage;
