
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DataEntryPage from "./pages/DataEntryPage";
import EditEntryPage from "./pages/EditEntryPage";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { TransportEntry } from "./types/transport";

const queryClient = new QueryClient();

const App = () => {
  const [entries, setEntries] = useState<TransportEntry[]>([]);

  const handleAddEntry = (entry: TransportEntry) => {
    setEntries(prev => [...prev, entry]);
  };

  const handleUpdateEntry = (updatedEntry: TransportEntry) => {
    setEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <Index 
                  entries={entries} 
                  setEntries={setEntries} 
                />
              } 
            />
            <Route 
              path="/add-entry" 
              element={
                <DataEntryPage 
                  onSubmit={handleAddEntry} 
                />
              } 
            />
            <Route 
              path="/edit-entry/:id" 
              element={
                <EditEntryPage 
                  entries={entries} 
                  onUpdate={handleUpdateEntry} 
                />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
