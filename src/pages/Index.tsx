import TransportEntries from "@/components/TransportEntries";
import ReportsDashboard from "@/components/ReportsDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTransportEntries, deleteTransportEntry } from "@/services/transportService";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransportEntry } from "@/types/transport";
import { useState } from "react";

const Index = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"entries" | "reports">("entries");
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['transportEntries'],
    queryFn: fetchTransportEntries,
    initialData: [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const handleDeleteEntry = async (id: string) => {
    try {
      const success = await deleteTransportEntry(id);
      if (success) {
        await queryClient.invalidateQueries({ queryKey: ['transportEntries'] });
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "entries" | "reports");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">Pratik Transport Co</h1>
            <p className="text-slate-500">Manage your transport entries and track payments</p>
          </div>
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
                <p>Error loading entries: {error?.message || 'Unknown error'}</p>
                <button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['transportEntries'] })}
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
                    entries={data ?? []} 
                    onDelete={handleDeleteEntry} 
                  />
                </TabsContent>
                <TabsContent value="reports" className="mt-0">
                  <ReportsDashboard entries={data ?? []} />
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
