
import { useState, useEffect } from "react";
import { CalendarDays, Clock, User, Settings, LogOut, Calendar, History, BadgeCheck, Upload, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { formatCurrency } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ReviewModal } from "@/components/ReviewModal";

// Interface para os agendamentos
interface Appointment {
  id: string;
  service_id: string;
  professional_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  service?: {
    name: string;
    price: number;
  };
  professional?: {
    name: string;
  };
}

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    avatar_url: string;
  }>({
    name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      setLoading(true);

      try {
        // Primeiro, tentamos obter os dados dos metadados do usuário
        const userData = user.user_metadata;

        // Depois, buscamos dados adicionais da tabela profiles
        const { data, error } = await supabase
          .from("profiles")
          .select("name, phone, avatar_url")
          .eq("id", user.id)
          .single();

        // Combinamos os dados, priorizando os metadados do usuário para o telefone
        setUserProfile({
          name: userData?.name || data?.name || "",
          email: user.email || "",
          phone: userData?.phone || data?.phone || "",
          avatar_url: data?.avatar_url || "",
        });

        // Se o telefone não estiver no perfil mas estiver nos metadados, atualizamos o perfil
        if (userData?.phone && !data?.phone) {
          await updateProfile({
            phone: userData.phone
          });
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast, updateProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const { success, error } = await updateProfile({
        name: userProfile.name,
        phone: userProfile.phone,
        avatar_url: userProfile.avatar_url,
      });

      if (!success && error) {
        throw new Error(error);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update the user profile with the new avatar URL
      const { success, error } = await updateProfile({
        avatar_url: avatarUrl,
      });

      if (!success && error) {
        throw new Error(error);
      }

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        avatar_url: avatarUrl,
      }));

      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso!",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Buscar agendamentos do usuário
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      setLoadingAppointments(true);

      try {
        // Buscar agendamentos com informações de serviço e profissional
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            service:service_id(name, price),
            professional:professional_id(id)
          `)
          .eq('client_id', user.id)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) throw error;

        // Buscar informações dos profissionais
        const professionalIds = data.map((app: any) => app.professional_id).filter(Boolean);

        // Se houver profissionais, buscar seus nomes
        let professionalNames: Record<string, string> = {};

        if (professionalIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', professionalIds);

          if (!profilesError && profilesData) {
            // Criar um mapa de id -> nome
            professionalNames = profilesData.reduce((acc: Record<string, string>, profile: any) => {
              acc[profile.id] = profile.name;
              return acc;
            }, {});
          }
        }

        // Formatar os dados para o formato esperado
        const formattedAppointments = data.map((appointment: any) => ({
          ...appointment,
          professional: {
            name: professionalNames[appointment.professional_id] || 'Profissional'
          }
        }));

        setAppointments(formattedAppointments);
      } catch (error: any) {
        console.error('Erro ao buscar agendamentos:', error);
        toast({
          title: 'Erro ao carregar agendamentos',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [user, toast]);

  const handleCancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      // Atualizar a lista de agendamentos localmente
      setAppointments(prev =>
        prev.map(app => app.id === id ? {...app, status: 'cancelled'} : app)
      );

      toast({
        title: "Agendamento cancelado",
        description: "Seu agendamento foi cancelado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar agendamento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Abrir modal de avaliação
  const handleOpenReviewModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setReviewModalOpen(true);
  };

  // Callback após avaliação bem-sucedida
  const handleReviewSuccess = () => {
    // Atualizar a lista de agendamentos localmente
    setAppointments(prev =>
      prev.map(app =>
        app.id === selectedAppointment?.id ? { ...app, status: "reviewed" } : app
      )
    );
  };

  // Filter appointments
  const upcomingAppointments = appointments.filter(app =>
    app.status === "scheduled" || app.status === "confirmed"
  );
  const completedAppointments = appointments.filter(app =>
    app.status === "completed"
  );
  const reviewedOrCancelledAppointments = appointments.filter(app =>
    app.status === "reviewed" || app.status === "cancelled"
  );
  const pastAppointments = [...completedAppointments, ...reviewedOrCancelledAppointments];

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={userProfile.avatar_url} alt={userProfile.name} />
                <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="bg-primary hover:bg-primary/90 text-white p-1 rounded-full">
                    <Upload className="h-4 w-4" />
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            <h1 className="text-2xl font-bold">{userProfile.name || "Usuário"}</h1>
            <p className="text-muted-foreground">{userProfile.email}</p>
          </div>

          <div className="flex-1">
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="appointments" className="text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendamentos
                </TabsTrigger>
                <TabsTrigger value="history" className="text-sm">
                  <History className="w-4 h-4 mr-2" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Perfil
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Agendamentos</CardTitle>
                    <CardDescription>
                      Visualize e gerencie seus agendamentos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingAppointments ? (
                      <div className="text-center py-8">
                        <p>Carregando agendamentos...</p>
                      </div>
                    ) : upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map(appointment => (
                          <Card key={appointment.id} className="beauty-card">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-start gap-2">
                                    <BadgeCheck className="h-5 w-5 text-beauty-purple shrink-0" />
                                    <div>
                                      <h3 className="font-medium">{appointment.service?.name || 'Serviço'}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        Com {appointment.professional?.name || 'Profissional'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex gap-4">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <CalendarDays className="h-4 w-4" />
                                      <span>
                                        {new Date(appointment.date).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      <span>{appointment.start_time}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col md:items-end justify-between">
                                  <p className="font-medium text-beauty-purple">
                                    {formatCurrency(appointment.service?.price || 0)}
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-medium text-lg mb-2">Nenhum agendamento futuro</h3>
                        <p className="text-muted-foreground mb-4">
                          Você não possui agendamentos futuros.
                        </p>
                        <Button asChild className="beauty-button">
                          <a href="/booking">
                            Fazer um agendamento
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Agendamentos</CardTitle>
                    <CardDescription>
                      Visualize seus atendimentos anteriores.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingAppointments ? (
                      <div className="text-center py-8">
                        <p>Carregando histórico...</p>
                      </div>
                    ) : pastAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {pastAppointments.map(appointment => (
                          <Card key={appointment.id} className="beauty-card">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-start gap-2">
                                    <BadgeCheck className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <div>
                                      <h3 className="font-medium">{appointment.service?.name || 'Serviço'}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        Com {appointment.professional?.name || 'Profissional'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex gap-4">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <CalendarDays className="h-4 w-4" />
                                      <span>
                                        {new Date(appointment.date).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      <span>{appointment.start_time}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col md:items-end justify-between">
                                  <p className="font-medium text-muted-foreground">
                                    {formatCurrency(appointment.service?.price || 0)}
                                  </p>
                                  {appointment.status === 'completed' ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-yellow-500 hover:text-yellow-600"
                                      onClick={() => handleOpenReviewModal(appointment)}
                                    >
                                      <Star className="h-4 w-4 mr-1" /> Avaliar
                                    </Button>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      {appointment.status === 'reviewed' ? 'Avaliado' : 'Cancelado'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-medium text-lg mb-2">Nenhum histórico</h3>
                        <p className="text-muted-foreground">
                          Você ainda não realizou nenhum atendimento.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Perfil</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                          id="name"
                          name="name"
                          value={userProfile.name}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={userProfile.email}
                          readOnly
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={userProfile.phone}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="pt-4 flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sair
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSaveProfile}
                          className="beauty-button"
                        >
                          Salvar alterações
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>

    {/* Modal de Avaliação */}
    {selectedAppointment && (
      <ReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        appointment={selectedAppointment}
        onSuccess={handleReviewSuccess}
      />
    )}
  );
};

export default ProfilePage;
