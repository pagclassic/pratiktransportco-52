
import TransportForm from "@/components/TransportForm";
import TransportEntries from "@/components/TransportEntries";
import { useState } from "react";
import { TransportEntry } from "@/types/transport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [entries, setEntries] = useState<TransportEntry[]>([]);

  const handleAddEntry = (entry: TransportEntry) => {
    setEntries([...entries, entry]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Transport Management</h1>
          <p className="text-slate-500">Manage your transport entries and track payments</p>
        </header>

        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="form">Transport Entry</TabsTrigger>
            <TabsTrigger value="entries">View Entries {entries.length > 0 && `(${entries.length})`}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>Transport Entry Form</CardTitle>
                <CardDescription>Create a new transport entry with vehicle and payment details</CardDescription>
              </CardHeader>
              <CardContent>
                <TransportForm onSubmit={handleAddEntry} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="entries">
            <Card>
              <CardHeader>
                <CardTitle>Transport Entries</CardTitle>
                <CardDescription>View and manage your transport entries</CardDescription>
              </CardHeader>
              <CardContent>
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
