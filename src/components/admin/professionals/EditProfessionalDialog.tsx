
import { useState, useEffect } from "react";
import { Professional, Service } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  role: z.string().min(2, {
    message: "Função deve ter pelo menos 2 caracteres.",
  }),
  about: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  image: z.string().url({
    message: "URL da imagem inválida.",
  }),
  services: z.array(z.string()).optional(),
});

interface EditProfessionalDialogProps {
  professional: Professional | null;
  services: Service[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

const EditProfessionalDialog = ({
  professional,
  services,
  open,
  onOpenChange,
  onSubmit,
}: EditProfessionalDialogProps) => {
  const [selectedServices, setSelectedServices] = useState<string[]>(
    professional?.services || []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: professional?.name || "",
      email: professional?.email || "",
      role: professional?.role || "",
      about: professional?.about || "",
      image: professional?.image || "",
      services: professional?.services || [],
    },
  });

  // Update form values when professional changes
  useEffect(() => {
    if (professional) {
      form.setValue("name", professional.name);
      form.setValue("email", professional.email);
      form.setValue("role", professional.role);
      form.setValue("about", professional.about);
      form.setValue("image", professional.image);
      setSelectedServices(professional.services);
    } else {
      form.reset();
      setSelectedServices([]);
    }
  }, [professional, form]);

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    // Ensure services is included in the submitted data
    data.services = selectedServices;
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {professional ? "Editar Profissional" : "Adicionar Profissional"}
          </DialogTitle>
          <DialogDescription>
            {professional
              ? "Edite os campos abaixo para atualizar o profissional."
              : "Preencha os campos abaixo para criar um novo profissional."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do profissional" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <FormControl>
                    <Input placeholder="Função do profissional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do profissional" {...field} />
                  </FormControl>
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
                    <Input
                      placeholder="URL da imagem do profissional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="services"
              render={() => (
                <FormItem>
                  <FormLabel>Serviços</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedServices([
                                ...selectedServices,
                                service.id,
                              ]);
                              form.setValue("services", [
                                ...selectedServices,
                                service.id,
                              ]);
                            } else {
                              setSelectedServices(
                                selectedServices.filter(
                                  (id) => id !== service.id
                                )
                              );
                              form.setValue(
                                "services",
                                selectedServices.filter(
                                  (id) => id !== service.id
                                )
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {service.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {professional ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfessionalDialog;
