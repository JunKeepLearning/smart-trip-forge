
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UIProvider } from "@/contexts/UIContext";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Plan from './pages/Plan';
import Itinerary from './pages/Itinerary';
import Checklist from './pages/Checklist';
import Finance from './pages/Finance';
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PricingPage from "./pages/PricingPage";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UIProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/plan/:tripId" element={<Itinerary />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<SearchResults />} />
            </Route>

            {/* Routes without MainLayout */}
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<PricingPage />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </UIProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
