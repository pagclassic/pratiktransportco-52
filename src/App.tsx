
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import DataEntryPage from "./pages/DataEntryPage";
import EditEntryPage from "./pages/EditEntryPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./components/AdminDashboard";
import UserLogin from "./components/UserLogin";
import EmailVerification from "./components/EmailVerification";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('currentUser');
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const adminData = localStorage.getItem('admin');
  
  // Improved admin verification check
  const isAdmin = adminData ? JSON.parse(adminData).isLoggedIn === true : false;
  
  console.log("AdminRoute check:", { adminData, isAdmin });
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Clear console on app start to help with debugging
  useEffect(() => {
    console.clear();
    console.log("App initialized");
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('admin');
        console.log("User signed out, cleared localStorage");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<UserLogin />} />
            <Route 
              path="/verify-admin" 
              element={
                <EmailVerification email="pratikgangurde35@gmail.com" />
              } 
            />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/add-entry" element={
              <ProtectedRoute>
                <DataEntryPage />
              </ProtectedRoute>
            } />
            <Route path="/edit-entry/:id" element={
              <ProtectedRoute>
                <EditEntryPage />
              </ProtectedRoute>
            } />
            
            {/* Improved AdminRoute handling */}
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
