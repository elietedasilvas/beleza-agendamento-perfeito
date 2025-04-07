
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

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface UserRoleDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPromoteAdmin: () => void;
  onMakeProfessional: () => void;
  isPromoting: boolean;
}

const UserRoleDialog = ({
  user,
  open,
  onOpenChange,
  onPromoteAdmin,
  onMakeProfessional,
  isPromoting,
}: UserRoleDialogProps) => {
  if (!user) return null;

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
            Usuário: <span className="font-semibold">{user.name || "Sem nome"}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Email: <span className="font-semibold">{user.email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Papel atual: <span className="font-semibold capitalize">{user.role}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onPromoteAdmin}
              className="w-full"
              disabled={isPromoting || user.role === "admin"}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Promover para Administrador
            </Button>
            <Button 
              onClick={onMakeProfessional}
              variant="outline"
              className="w-full"
              disabled={isPromoting || user.role === "professional"}
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

export default UserRoleDialog;
