import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransportEntries from "@/components/TransportEntries";
import ReportsDashboard from "@/components/ReportsDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Loader2, LogOut, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTransportEntries, deleteTransportEntry } from "@/services/transportService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransportEntry } from "@/types/transport";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"entries" | "reports">("entries");
  const [companyName, setCompanyName] = useState<string>("Transport Dashboard");
  const [isServicePaused, setIsServicePaused] = useState(false);
  
  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.companyName) {
      setCompanyName(user.companyName);
    }

    // Check company status
    const companies = JSON.parse(localStorage.getItem('transportCompanies') || '[]');
    const userCompany = companies.find((company: any) => company.id === user.companyId);
    if (userCompany && !userCompany.isActive) {
      setIsServicePaused(true);
    }
  }, [navigate]);
  
  const { data = [], isLoading, isError, error, refetch } = useQuery<TransportEntry[], Error>({
    queryKey: ['transportEntries'],
    queryFn: fetchTransportEntries,
    initialData: [],
    staleTime: 1000 * 60,
    retry: 3,
  });

  useEffect(() => {
    console.log("Index component mounted, refetching data...");
    refetch();
  }, [refetch]);

  const handleDeleteEntry = async (id: string) => {
    try {
      const success = await deleteTransportEntry(id);
      if (success) {
        await queryClient.invalidateQueries({ queryKey: ['transportEntries'] });
        toast.success('Entry deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "entries" | "reports");
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase auth
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.removeItem('currentUser');
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback: still remove from localStorage even if Supabase auth fails
      localStorage.removeItem('currentUser');
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      {isServicePaused && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-600">Service Paused</h3>
                <p className="text-gray-600">
                  Your transport service has been paused by the administrator. Please contact the administrator to renew your service and make the necessary payment to continue using the platform.
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              For immediate assistance, please reach out to your administrator.
            </div>
          </div>
        </div>
      )}
      
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">{companyName}</h1>
              <p className="text-slate-500">Manage your transport entries and track payments</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </header>

        <Card className="border-none shadow-lg animate-in">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-primary">
              Transport Management
            </CardTitle>
            <CardDescription>View and manage your transport entries and reports</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="text-center py-12 text-red-500">
                <p>Error loading entries: {error instanceof Error ? error.message : 'Unknown error'}</p>
                <button 
                  onClick={() => refetch()}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <Tabs 
                value={activeTab} 
                onValueChange={handleTabChange}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm mb-4">
                  <TabsTrigger value="entries" className="text-base py-3">Transport Entries</TabsTrigger>
                  <TabsTrigger value="reports" className="text-base py-3">Reports & Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="entries" className="mt-0">
                  <TransportEntries 
                    entries={data} 
                    onDelete={handleDeleteEntry} 
                  />
                </TabsContent>
                <TabsContent value="reports" className="mt-0">
                  <ReportsDashboard entries={data} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
