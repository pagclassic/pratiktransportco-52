
import TransportEntries from "@/components/TransportEntries";
import { useState } from "react";
import { TransportEntry } from "@/types/transport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

const Index = () => {
  const [entries, setEntries] = useState<TransportEntry[]>([]);

  const handleAddEntry = (entry: TransportEntry) => {
    setEntries([...entries, entry]);
  };

  const handleUpdateEntry = (updatedEntry: TransportEntry) => {
    setEntries(entries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
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

        <Card className="border-none shadow-lg animate-in">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-primary">
              Transport Entries
            </CardTitle>
            <CardDescription>View and manage your transport entries</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <TransportEntries 
              entries={entries} 
              onDelete={handleDeleteEntry} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
