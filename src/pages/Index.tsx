
import TransportForm from "@/components/TransportForm";
import TransportEntries from "@/components/TransportEntries";
import { useState } from "react";
import { TransportEntry } from "@/types/transport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

const Index = () => {
  const [entries, setEntries] = useState<TransportEntry[]>([]);

  const handleAddEntry = (entry: TransportEntry) => {
    setEntries([...entries, entry]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">Transport Management</h1>
            <p className="text-slate-500">Manage your transport entries and track payments</p>
          </div>
        </header>

        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="form" className="text-sm md:text-base">
              <span className="flex items-center gap-2">
                Transport Entry
              </span>
            </TabsTrigger>
            <TabsTrigger value="entries" className="text-sm md:text-base">
              <span className="flex items-center gap-2">
                View Entries {entries.length > 0 && <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-medium">{entries.length}</span>}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-primary">
                  Transport Entry Form
                </CardTitle>
                <CardDescription>Create a new transport entry with vehicle and payment details</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <TransportForm onSubmit={handleAddEntry} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="entries">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-primary">
                  Transport Entries
                </CardTitle>
                <CardDescription>View and manage your transport entries</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <TransportEntries entries={entries} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
