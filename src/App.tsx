import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/common/ScrollToTop";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import GlobalNotifications from "@/components/common/GlobalNotifications";
import GlobalLoading from "@/components/common/GlobalLoading";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Index from "@/pages/Index";
import Explore from "@/pages/Explore";
import Plan from "@/pages/Plan";
import Costs from "@/pages/Costs";
import Itinerary from "@/pages/Itinerary";
import Checklist from "@/pages/Checklist";
import ChecklistDetail from "@/pages/ChecklistDetail";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import PricingPage from "@/pages/PricingPage";
import NotFound from "@/pages/NotFound";
import SearchResults from "@/pages/SearchResults";
import MyFavorites from "@/pages/MyFavorites";
import ChinaTravelGuide from "@/pages/ChinaTravelGuide";

// Protected Route Component
import { ProtectedRoute } from "@/components/auth";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { loading, error } = useAuthSubscription();

  // Show loading state while initializing auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if auth initialization failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Authentication Error</h2>
          <p className="mt-2 text-muted-foreground">{error.message}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalNotifications />
        <GlobalLoading />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Routes>
            {/* Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/plan/:tripId" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/checklist/:checklistId" element={<ProtectedRoute><ChecklistDetail /></ProtectedRoute>} />
              <Route path="/costs" element={<Costs />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/my-favorites" element={<ProtectedRoute><MyFavorites /></ProtectedRoute>} />
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
    </ErrorBoundary>
  );
};

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;
