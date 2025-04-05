
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-beauty-light/50">
      <div className="text-center max-w-md px-6">
        <h1 className="text-6xl font-bold text-beauty-purple mb-6">404</h1>
        <p className="text-xl text-foreground mb-8">
          Ops! A página que você está procurando não foi encontrada.
        </p>
        <Button asChild className="beauty-button">
          <a href="/">
            <Home className="mr-2 h-4 w-4" />
            Voltar para Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
