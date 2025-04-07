
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import AuthPage from "./pages/Auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminServices from "./pages/admin/Services";
import AdminProfessionals from "./pages/admin/Professionals";
import AdminUsers from "./pages/admin/Users";
import AdminAppointments from "./pages/admin/Appointments";
import AdminSettings from "./pages/admin/Settings";
import AdminSchedule from "./pages/admin/Schedule";
import AdminReviews from "./pages/admin/Reviews";

// Professional pages
import ProfessionalLogin from "./pages/professional/Login";
import ProfessionalDashboard from "./pages/professional/Dashboard";
import ProfessionalSchedule from "./pages/professional/Schedule";
import ProfessionalClients from "./pages/professional/Clients";

// Auth Context
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Auth route */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Client-facing routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="professionals" element={<ProfessionalsPage />} />
            <Route path="booking/:professionalId?" element={<BookingPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin routes - protected */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="professionals" element={<AdminProfessionals />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="schedule" element={<AdminSchedule />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Professional routes - protected */}
          <Route element={<ProtectedRoute requiredRole="professional" />}>
            <Route path="/professional" element={<ProfessionalLayout />}>
              <Route index element={<ProfessionalDashboard />} />
              <Route path="dashboard" element={<ProfessionalDashboard />} />
              <Route path="schedule" element={<ProfessionalSchedule />} />
              <Route path="clients" element={<ProfessionalClients />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
