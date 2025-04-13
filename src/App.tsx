
import React from 'react';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Auth guard for routes that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('currentUser');
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin route guard
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const adminData = localStorage.getItem('admin');
  const isAdmin = adminData && JSON.parse(adminData).isLoggedIn;
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<UserLogin />} />
            <Route 
              path="/verify-admin" 
              element={
                <EmailVerification email="pratikgagurde35@gmail.com" />
              } 
            />
            
            {/* Protected routes */}
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
            
            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
