import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import LightRays from "@/components/LightRays";
// Removed Index import
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
import EventDetail from "./pages/EventDetail";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering');
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen bg-background relative">
                  <LightRays
                    raysOrigin="top-center"
                    raysSpeed={1.5}
                    lightSpread={0.8}
                    rayLength={1.2}
                    followMouse={true}
                    mouseInfluence={0.1}
                    noiseAmount={0.1}
                    distortion={0.05}
                    className="fixed inset-0"
                  />
                  <div className="relative z-10">
                    <Routes>
                      <Route path="/" element={<Layout><Events /></Layout>} />
                      <Route path="/events" element={<Layout><Events /></Layout>} />
                      <Route path="/events/:eventId" element={<Layout><EventDetail /></Layout>} />
                      <Route path="/auth" element={<Layout showFooter={false}><Auth /></Layout>} />
                      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                      <Route path="/profile" element={<Layout><Profile /></Layout>} />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/events" element={<AdminEvents />} />
                      <Route path="/admin/events/create" element={<CreateEvent />} />
                      <Route path="/admin/events/:eventId/edit" element={<CreateEvent />} />
                      <Route path="/admin/events/:eventId/registrations" element={<EventRegistrations />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="*" element={<Layout><NotFound /></Layout>} />
                    </Routes>
                  </div>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
