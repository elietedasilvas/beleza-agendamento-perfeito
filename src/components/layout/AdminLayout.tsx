
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

// Create a conditional sidebar toggle button that appears when sidebar is collapsed
const FloatingToggleButton = () => {
  const { state, toggleSidebar } = useSidebar();
  
  if (state !== "collapsed") return null;
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="fixed left-4 top-4 z-50 rounded-full shadow-md hover:shadow-lg bg-white"
      onClick={toggleSidebar}
    >
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <FloatingToggleButton />
        <main className="flex-grow p-6">
          <Outlet />
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
