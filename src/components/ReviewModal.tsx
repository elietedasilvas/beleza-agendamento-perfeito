import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Rating } from "@/components/ui/rating";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: string;
    professional_id: string;
    client_id: string;
    service?: {
      name: string;
    };
    professional?: {
      name: string;
    };
  };
  onSuccess: () => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating < 1) {
      toast({
        title: "Avaliação inválida",
        description: "Por favor, selecione pelo menos uma estrela.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Inserir a avaliação no banco de dados
      const { error } = await supabase.from("reviews").insert({
        appointment_id: appointment.id,
        client_id: appointment.client_id,
        professional_id: appointment.professional_id,
        rating,
        comment: comment.trim() || null,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Atualizar o status do agendamento para indicar que foi avaliado
      await supabase
        .from("appointments")
        .update({ status: "reviewed" })
        .eq("id", appointment.id);

      toast({
        title: "Avaliação enviada",
        description: "Obrigado por avaliar o serviço!",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar Serviço</DialogTitle>
          <DialogDescription>
            Avalie o serviço {appointment.service?.name} realizado por{" "}
            {appointment.professional?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium">Como você avalia este serviço?</p>
            <Rating value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Comentário (opcional)</p>
            <Textarea
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
