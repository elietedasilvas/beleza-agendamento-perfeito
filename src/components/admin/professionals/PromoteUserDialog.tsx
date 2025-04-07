
import { Professional } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Scissors } from "lucide-react";

interface PromoteUserDialogProps {
  professional: Professional | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPromoteAdmin: () => void;
  onMakeProfessional: () => void;
  isPromoting: boolean;
}

const PromoteUserDialog = ({
  professional,
  open,
  onOpenChange,
  onPromoteAdmin,
  onMakeProfessional,
  isPromoting,
}: PromoteUserDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Papel do Usuário</DialogTitle>
          <DialogDescription>
            Defina o papel deste usuário no sistema. Esta ação pode conceder permissões adicionais ao usuário.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Usuário: <span className="font-semibold">{professional?.name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Email: <span className="font-semibold">{professional?.email}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onPromoteAdmin}
              className="w-full"
              disabled={isPromoting}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Promover para Administrador
            </Button>
            <Button 
              onClick={onMakeProfessional}
              variant="outline"
              className="w-full"
              disabled={isPromoting}
            >
              <Scissors className="mr-2 h-4 w-4" />
              Definir como Profissional
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPromoting}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteUserDialog;
