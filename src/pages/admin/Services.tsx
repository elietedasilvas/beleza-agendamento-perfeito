
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { services as originalServices, formatCurrency, formatDuration, Service } from "@/data/mockData";
import { toast } from "sonner";
import { addService } from "@/integrations/supabase/admin-api";
import { supabase } from "@/integrations/supabase/client";

// Create a global variable to track the updated services
// In a real application, this would be managed by a global state management solution
// or saved to a backend database
if (!window.updatedServices) {
  window.updatedServices = [...originalServices];
}

const ServicesAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [servicesList, setServicesList] = useState(window.updatedServices);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "",
      image: ""
    }
  });
  
  const onOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingService(null);
      form.reset({
        name: "",
        description: "",
        price: "",
        duration: "",
        category: "",
        image: ""
      });
    }
  };
  
  const onEditService = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      image: service.image
    });
    setIsDialogOpen(true);
  };
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const serviceData = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        duration: Number(data.duration),
        category: data.category,
        image: data.image || null
      };
      
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", editingService.id);
          
        if (error) throw error;
        
        const updatedService = {
          ...editingService,
          ...serviceData
        };
        
        // Update local state
        const updatedList = servicesList.map(s => 
          s.id === editingService.id ? updatedService : s
        );
        setServicesList(updatedList);
        window.updatedServices = updatedList;
        
        toast.success("Serviço atualizado com sucesso!");
      } else {
        // Add new service
        const newService = await addService(serviceData);
        
        if (newService) {
          const updatedList = [...servicesList, newService];
          setServicesList(updatedList);
          window.updatedServices = updatedList;
          toast.success("Novo serviço adicionado com sucesso!");
        }
      }
      
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast.error("Erro ao salvar serviço. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onDeleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      const updatedList = servicesList.filter(s => s.id !== id);
      setServicesList(updatedList);
      window.updatedServices = updatedList;
      toast.success("Serviço removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover serviço:", error);
      toast.error("Erro ao remover serviço. Tente novamente.");
    }
  };
  
  const categoryNames = {
    hair: "Cabelo",
    face: "Rosto",
    body: "Corpo",
    barber: "Barbearia"
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Gerenciar Serviços</h1>
          <p className="text-muted-foreground">Adicione, edite ou remova serviços do salão.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button className="beauty-button">
              <Plus className="h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Editar Serviço" : "Adicionar Novo Serviço"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do serviço abaixo.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Serviço</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Corte de Cabelo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva o serviço..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (minutos)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="60" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hair">Cabelo</SelectItem>
                          <SelectItem value="face">Rosto</SelectItem>
                          <SelectItem value="body">Corpo</SelectItem>
                          <SelectItem value="barber">Barbearia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting 
                      ? "Salvando..." 
                      : (editingService ? "Salvar Alterações" : "Adicionar Serviço")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicesList.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{categoryNames[service.category as keyof typeof categoryNames]}</TableCell>
                <TableCell>{formatCurrency(service.price)}</TableCell>
                <TableCell>{formatDuration(service.duration)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => onEditService(service)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive" 
                            onClick={() => onDeleteService(service.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ServicesAdmin;
