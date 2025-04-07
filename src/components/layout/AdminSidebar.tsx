
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Scissors, Home, Settings, LogOut, Clock, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="px-6 py-5">
          <h2 className="text-xl font-playfair font-semibold text-beauty-purple">Admin Portal</h2>
          <p className="text-xs text-muted-foreground">Gerenciamento do Salão</p>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/admin") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/admin">
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/admin/services") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/admin/services">
                    <Scissors className="w-4 h-4" />
                    <span>Serviços</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/admin/professionals") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/admin/professionals">
                    <Users className="w-4 h-4" />
                    <span>Profissionais</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/admin/users") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/admin/users">
                    <User className="w-4 h-4" />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/admin/schedule") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/admin/schedule">
                    <Clock className="w-4 h-4" />
                    <span>Agenda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/admin/appointments") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/admin/appointments">
                    <Calendar className="w-4 h-4" />
                    <span>Agendamentos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/admin/settings") ? "bg-primary/10 text-primary" : ""}>
                  <Link to="/admin/settings">
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2">
          <Link to="/" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
            <Home className="w-4 h-4" />
            <span>Voltar ao Site</span>
          </Link>
          <button 
            className="flex items-center gap-2 text-destructive p-2 w-full text-left rounded-md hover:bg-accent"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
