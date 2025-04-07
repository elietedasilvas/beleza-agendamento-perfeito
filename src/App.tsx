
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import ProfessionalLayout from "./components/layout/ProfessionalLayout";
import HomePage from "./pages/Index";
import ProfessionalsPage from "./pages/Professionals";
import BookingPage from "./pages/Booking";
import ProfilePage from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminServices from "./pages/admin/Services";
import AdminProfessionals from "./pages/admin/Professionals";
import AdminAppointments from "./pages/admin/Appointments";
import AdminSettings from "./pages/admin/Settings";
import AdminSchedule from "./pages/admin/Schedule";

// Professional pages
import ProfessionalLogin from "./pages/professional/Login";
import ProfessionalDashboard from "./pages/professional/Dashboard";
import ProfessionalSchedule from "./pages/professional/Schedule";
import ProfessionalClients from "./pages/professional/Clients";

// Contexts
import { ProfessionalAuthProvider } from "./contexts/ProfessionalAuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProfessionalAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Client-facing routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="professionals" element={<ProfessionalsPage />} />
              <Route path="booking/:professionalId?" element={<BookingPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="professionals" element={<AdminProfessionals />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="schedule" element={<AdminSchedule />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Professional routes */}
            <Route path="/professional/login" element={<ProfessionalLogin />} />
            <Route path="/professional" element={<ProfessionalLayout />}>
              <Route index element={<ProfessionalDashboard />} />
              <Route path="dashboard" element={<ProfessionalDashboard />} />
              <Route path="schedule" element={<ProfessionalSchedule />} />
              <Route path="clients" element={<ProfessionalClients />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProfessionalAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
