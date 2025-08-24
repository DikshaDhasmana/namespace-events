import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import CreateEvent from "./pages/CreateEvent";
import AdminUsers from "./pages/AdminUsers";
import EventRegistrations from "./pages/EventRegistrations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<><Navbar /><Index /></>} />
                <Route path="/events" element={<><Navbar /><Events /></>} />
                <Route path="/auth" element={<><Navbar /><Auth /></>} />
                <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
                <Route path="/profile" element={<><Navbar /><Profile /></>} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/events/create" element={<CreateEvent />} />
                <Route path="/admin/events/:eventId/edit" element={<CreateEvent />} />
                <Route path="/admin/events/:eventId/registrations" element={<EventRegistrations />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="*" element={<><Navbar /><NotFound /></>} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
