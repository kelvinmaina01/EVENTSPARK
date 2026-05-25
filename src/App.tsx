import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SeoManager } from "@/lib/seo";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import CompanyPage from "./pages/CompanyPage";
import EventsList from "./pages/EventsList";
import EventPublicDetail from "./pages/EventPublicDetail";
import Discover from "./pages/Discover";
import LocalPlaceDetail from "./pages/LocalPlaceDetail";
import Calendars from "./pages/Calendars";
import CalendarDetail from "./pages/CalendarDetail";
import FinishSignup from "./pages/FinishSignup";
import ProfilePage from "./pages/ProfilePage";
import About from "./pages/About";
import Features from "./pages/Features";
import UseCases from "./pages/UseCases";
import Compare from "./pages/Compare";
import Blog from "./pages/Blog";
import SeoLandingPage from "./pages/SeoLandingPage";

import Pricing from "./pages/Pricing";
import QRCode from "./pages/QRCode";
import Events from "./pages/dashboard/Events";
import CreateEvent from "./pages/dashboard/CreateEvent";
import EventDetail from "./pages/dashboard/EventDetail";
import CheckIn from "./pages/dashboard/CheckIn";
import Attendees from "./pages/dashboard/Attendees";
import Analytics from "./pages/dashboard/Analytics";
import Integrations from "./pages/dashboard/Integrations";
import Payments from "./pages/dashboard/Payments";
import SettingsPage from "./pages/dashboard/SettingsPage";
import Calendar from "./pages/dashboard/Calendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="app-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <SeoManager />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/use-cases" element={<UseCases />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/register/:slug" element={<Register />} />
              <Route path="/company/:companySlug" element={<CompanyPage />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/city/:citySlug" element={<SeoLandingPage type="city" />} />
              <Route path="/events/category/:categorySlug" element={<SeoLandingPage type="category" />} />
              <Route path="/events/:slug" element={<EventPublicDetail />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/local/:citySlug" element={<LocalPlaceDetail />} />
              <Route path="/calendars" element={<Calendars />} />
              <Route path="/cal/:calendarSlug" element={<CalendarDetail />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/qr" element={<QRCode />} />
              <Route path="/finish-signup" element={<FinishSignup />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />

              {/* Dashboard (protected) */}
              <Route path="/dashboard" element={<Navigate to="/dashboard/events" replace />} />
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="events" element={<Events />} />
                      <Route path="events/create" element={<CreateEvent />} />
                      <Route path="events/:id" element={<EventDetail />} />
                      <Route path="events/:id/edit" element={<CreateEvent />} />
                      <Route path="events/:id/checkin" element={<CheckIn />} />
                      <Route path="calendar" element={<Calendar />} />
                      <Route path="attendees" element={<Attendees />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="integrations" element={<Integrations />} />
                      <Route path="payments" element={<Payments />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
