
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Calendar, Home, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/use-role";

const ProfessionalLayout = () => {
  const { user, logout } = useAuth();
  const { role, isLoading } = useRole();

  // If the user is not a professional, professional auth will handle the redirect
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <p>Carregando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navbar */}
      <header className="bg-primary text-primary-foreground shadow">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="font-medium">{user?.user_metadata?.name || "Profissional"}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/professional" className="text-sm flex items-center gap-1 hover:underline">
              <Calendar className="h-4 w-4" />
              <span>Agenda</span>
            </Link>
            <Link to="/professional/schedule" className="text-sm flex items-center gap-1 hover:underline">
              <Calendar className="h-4 w-4" />
              <span>Disponibilidade</span>
            </Link>
            <Link to="/professional/clients" className="text-sm flex items-center gap-1 hover:underline">
              <Users className="h-4 w-4" />
              <span>Clientes</span>
            </Link>
            <Link to="/" className="text-sm flex items-center gap-1 hover:underline">
              <Home className="h-4 w-4" />
              <span>Página Inicial</span>
            </Link>
            <Button variant="outline" size="sm" onClick={logout} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <LogOut className="h-4 w-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow bg-muted/10">
        <div className="container mx-auto py-6 px-4">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-4 text-center text-muted-foreground text-sm">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} Salão de Beleza - Área do Profissional
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalLayout;
