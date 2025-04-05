
import { Link } from "react-router-dom";
import { Calendar, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-beauty-light border-t py-10">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-beauty-purple" />
            <span className="font-playfair text-lg font-bold">BeautéTime</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Transformando a experiência de agendamento para clínicas de estética e barbearias.
          </p>
        </div>
        
        <div className="md:col-span-1">
          <h3 className="text-sm font-semibold mb-4">Navegação</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/professionals" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Profissionais
              </Link>
            </li>
            <li>
              <Link to="/booking" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Agendamento
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Perfil
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="md:col-span-1">
          <h3 className="text-sm font-semibold mb-4">Serviços</h3>
          <ul className="space-y-2">
            <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Estética Facial
            </li>
            <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Estética Corporal
            </li>
            <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Cabelo
            </li>
            <li className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Barbear
            </li>
          </ul>
        </div>
        
        <div className="md:col-span-1">
          <h3 className="text-sm font-semibold mb-4">Contato</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Siga-nos nas redes sociais para ficar por dentro das novidades.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-muted-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="container mt-8 pt-8 border-t">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BeautéTime. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
