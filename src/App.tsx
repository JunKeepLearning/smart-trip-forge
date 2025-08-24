
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { UIProvider } from "@/contexts/UIContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { TripsProvider } from "@/contexts/TripsContext";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Index from "@/pages/Index";
import Explore from "@/pages/Explore";
import Plan from '@/pages/Plan';
import Costs from '@/pages/Costs';
import Itinerary from '@/pages/Itinerary';
import Checklist from '@/pages/Checklist';
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import PricingPage from "@/pages/PricingPage";
import NotFound from "@/pages/NotFound";
import SearchResults from "@/pages/SearchResults";
import MyFavorites from "@/pages/MyFavorites";
import ChinaTravelGuide from "@/pages/ChinaTravelGuide";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UIProvider>
        <FavoritesProvider>
          <TripsProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <Routes>
                {/* Routes with MainLayout */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/plan" element={<Plan />} />
                  <Route path="/plan/:tripId" element={<Itinerary />} />
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="/costs" element={<Costs />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/my-favorites" element={<MyFavorites />} />
                  <Route path="/search" element={<SearchResults />} />
                <Route path="/guides/first-time-china" element={<ChinaTravelGuide />} />
                </Route>

                {/* Routes without MainLayout */}
                <Route path="/login" element={<Login />} />
                <Route path="/pricing" element={<PricingPage />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
          </TripsProvider>
        </FavoritesProvider>
      </UIProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
