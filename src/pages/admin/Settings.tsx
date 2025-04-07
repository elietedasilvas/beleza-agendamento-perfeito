import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Instagram, Facebook, Twitter, Globe, Phone, Mail, MapPin, Image, Type } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsAdmin = () => {
  const [saving, setSaving] = useState(false);
  const { settings, loading, updateSettings } = useSettings();

  const form = useForm({
    defaultValues: {
      // Informações básicas
      salonName: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      instagram: "",
      facebook: "",
      twitter: "",
      aboutText: "",

      // Página inicial
      heroImage: "",
      heroTitle: "",
      heroSubtitle: "",

      // Horários
      openingHours: {
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
        saturday: "",
        sunday: ""
      },

      // Configurações de agendamento
      bookingSettings: {
        advanceBookingDays: "",
        timeSlotDuration: "",
        autoConfirm: false,
        sendReminders: false
      }
    }
  });

  // Carregar configurações do banco de dados
  useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      form.reset({
        salonName: settings.salon_name || "",
        address: settings.salon_address || "",
        phone: settings.salon_phone || "",
        email: settings.salon_email || "",
        website: settings.salon_website || "",
        instagram: settings.salon_instagram || "",
        facebook: settings.salon_facebook || "",
        twitter: settings.salon_twitter || "",
        aboutText: settings.about_text || "",

        heroImage: settings.hero_image || "",
        heroTitle: settings.hero_title || "",
        heroSubtitle: settings.hero_subtitle || "",

        openingHours: {
          monday: settings.opening_hours_monday || "",
          tuesday: settings.opening_hours_tuesday || "",
          wednesday: settings.opening_hours_wednesday || "",
          thursday: settings.opening_hours_thursday || "",
          friday: settings.opening_hours_friday || "",
          saturday: settings.opening_hours_saturday || "",
          sunday: settings.opening_hours_sunday || ""
        },

        bookingSettings: {
          advanceBookingDays: settings.booking_advance_days || "",
          timeSlotDuration: settings.booking_time_slot || "",
          autoConfirm: settings.booking_auto_confirm === "true",
          sendReminders: settings.booking_send_reminders === "true"
        }
      });
    }
  }, [loading, settings, form]);

  const onSubmit = async (data: any) => {
    setSaving(true);

    try {
      // Mapear os dados do formulário para o formato do banco de dados
      const settingsToUpdate = {
        salon_name: data.salonName,
        salon_address: data.address,
        salon_phone: data.phone,
        salon_email: data.email,
        salon_website: data.website,
        salon_instagram: data.instagram,
        salon_facebook: data.facebook,
        salon_twitter: data.twitter,
        about_text: data.aboutText,

        hero_image: data.heroImage,
        hero_title: data.heroTitle,
        hero_subtitle: data.heroSubtitle,

        opening_hours_monday: data.openingHours.monday,
        opening_hours_tuesday: data.openingHours.tuesday,
        opening_hours_wednesday: data.openingHours.wednesday,
        opening_hours_thursday: data.openingHours.thursday,
        opening_hours_friday: data.openingHours.friday,
        opening_hours_saturday: data.openingHours.saturday,
        opening_hours_sunday: data.openingHours.sunday,

        booking_advance_days: data.bookingSettings.advanceBookingDays,
        booking_time_slot: data.bookingSettings.timeSlotDuration,
        booking_auto_confirm: data.bookingSettings.autoConfirm.toString(),
        booking_send_reminders: data.bookingSettings.sendReminders.toString()
      };

      const result = await updateSettings(settingsToUpdate);

      if (result.success) {
        toast.success("Configurações salvas com sucesso!");
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-playfair font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do seu salão.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="homepage">Página Inicial</TabsTrigger>
              <TabsTrigger value="hours">Horários</TabsTrigger>
              <TabsTrigger value="booking">Agendamento</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>Configure as informações principais do seu salão.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="salonName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Salão</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input className="rounded-l-none" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input className="rounded-l-none" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input className="rounded-l-none" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0">
                                <Instagram className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input className="rounded-l-none" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Apenas o nome de usuário
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0">
                                <Facebook className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input className="rounded-l-none" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Apenas o nome de usuário
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0">
                                <Twitter className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input className="rounded-l-none" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Apenas o nome de usuário
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input className="rounded-l-none" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aboutText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobre o Salão</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva seu salão..."
                            className="h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="homepage">
              <Card>
                <CardHeader>
                  <CardTitle>Página Inicial</CardTitle>
                  <CardDescription>Configure a aparência da página inicial.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="heroImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem Hero</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input className="rounded-l-none" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          URL da imagem de fundo da seção principal da página inicial
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título Principal</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0">
                              <Type className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input className="rounded-l-none" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtítulo</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Texto descritivo que aparece abaixo do título principal..."
                            className="h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pré-visualização */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Pré-visualização:</h3>
                    <div className="relative overflow-hidden rounded-lg border h-40">
                      <div className="absolute inset-0 beauty-gradient opacity-90 z-0"></div>
                      <div
                        className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
                        style={{ backgroundImage: `url('${form.watch('heroImage')}')` }}
                      ></div>
                      <div className="relative z-10 p-4 text-white h-full flex flex-col justify-center items-center text-center">
                        <h2 className="text-xl font-bold mb-2">{form.watch('heroTitle') || 'Título Principal'}</h2>
                        <p className="text-sm opacity-90">{form.watch('heroSubtitle') || 'Subtítulo descritivo da página inicial'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hours">
              <Card>
                <CardHeader>
                  <CardTitle>Horário de Funcionamento</CardTitle>
                  <CardDescription>Configure os horários de funcionamento do salão.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="openingHours.monday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Segunda-feira</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="openingHours.tuesday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terça-feira</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="openingHours.wednesday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quarta-feira</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="openingHours.thursday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quinta-feira</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="openingHours.friday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexta-feira</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="openingHours.saturday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sábado</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="openingHours.sunday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domingo</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="booking">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Agendamento</CardTitle>
                  <CardDescription>Configure como os agendamentos funcionam.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bookingSettings.advanceBookingDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dias para Agendamento Antecipado</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Quantos dias no futuro os clientes podem agendar
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bookingSettings.timeSlotDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração dos Intervalos (minutos)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Duração de cada intervalo de tempo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bookingSettings.autoConfirm"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Confirmação Automática</FormLabel>
                            <FormDescription>
                              Confirmar agendamentos automaticamente sem revisão manual
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bookingSettings.sendReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Enviar Lembretes</FormLabel>
                            <FormDescription>
                              Enviar lembretes automáticos por e-mail/SMS para os clientes
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full md:w-auto" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar Configurações
              </span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SettingsAdmin;
