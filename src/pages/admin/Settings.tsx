
import { useState } from "react";
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
import { Save, Instagram, Facebook, Twitter, Globe, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

const SettingsAdmin = () => {
  const [saving, setSaving] = useState(false);
  
  const form = useForm({
    defaultValues: {
      salonName: "Beauty Spa & Barbearia",
      address: "Rua das Flores, 123 - São Paulo, SP",
      phone: "(11) 99123-4567",
      email: "contato@beautyspa.com",
      website: "www.beautyspa.com",
      instagram: "beautyspa",
      facebook: "beautyspaoficial",
      twitter: "beautyspa",
      aboutText: "Beauty Spa & Barbearia é um espaço dedicado à beleza e bem-estar, oferecendo serviços de alta qualidade para cuidados com cabelo, rosto, corpo e barbearia. Nossa equipe de profissionais qualificados está comprometida em proporcionar uma experiência única.",
      openingHours: {
        monday: "9:00 - 19:00",
        tuesday: "9:00 - 19:00",
        wednesday: "9:00 - 19:00",
        thursday: "9:00 - 19:00",
        friday: "9:00 - 19:00",
        saturday: "9:00 - 17:00",
        sunday: "Fechado"
      },
      bookingSettings: {
        advanceBookingDays: "30",
        timeSlotDuration: "30",
        autoConfirm: true,
        sendReminders: true
      }
    }
  });
  
  const onSubmit = (data: any) => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Settings saved:", data);
      setSaving(false);
      toast.success("Configurações salvas com sucesso!");
    }, 1000);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-playfair font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do seu salão.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Input {...field} />
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
          
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>Configure suas redes sociais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        Nome da página
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
            </CardContent>
          </Card>
          
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
