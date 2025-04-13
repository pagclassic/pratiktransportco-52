
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransportEntries from "@/components/TransportEntries";
import ReportsDashboard from "@/components/ReportsDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Loader2, LogOut } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTransportEntries, deleteTransportEntry } from "@/services/transportService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransportEntry } from "@/types/transport";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"entries" | "reports">("entries");
  const [companyName, setCompanyName] = useState<string>("Transport Dashboard");
  
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.companyName) {
      setCompanyName(user.companyName);
    }
  }, [navigate]);
  
  const { data = [], isLoading, isError, error, refetch } = useQuery<TransportEntry[], Error>({
    queryKey: ['transportEntries'],
    queryFn: fetchTransportEntries,
    initialData: [],
    staleTime: 1000 * 60,
    retry: 3,
  });

  // Force refetch on component mount
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

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
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
