
import { useState } from "react";
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
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProfessional } from "@/integrations/supabase/admin-api";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  password: z.string().min(6, {
    message: "Senha deve ter pelo menos 6 caracteres.",
  }),
});

interface CreateProfessionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: any) => void;
}

const CreateProfessionalDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateProfessionalDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  
  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const result = await createProfessional({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      toast.success(`Profissional ${data.name} criado com sucesso`);
      form.reset();
      onSuccess(result);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao criar profissional:", error);
      toast.error(`Erro ao criar profissional: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Profissional</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar uma nova conta de profissional.
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
                    <Input 
                      type="email" 
                      placeholder="email@exemplo.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="********" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar Profissional"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProfessionalDialog;
