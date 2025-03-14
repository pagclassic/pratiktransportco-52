
import TransportForm from "@/components/TransportForm";
import { TransportEntry } from "@/types/transport";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

interface EditEntryPageProps {
  entries: TransportEntry[];
  onUpdate: (updatedEntry: TransportEntry) => void;
}

const EditEntryPage = ({ entries, onUpdate }: EditEntryPageProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<TransportEntry | null>(null);

  useEffect(() => {
    const foundEntry = entries.find(e => e.id === id);
    if (foundEntry) {
      setEntry(foundEntry);
    } else {
      navigate('/');
    }
  }, [id, entries, navigate]);
  
  const handleSubmit = (updatedEntry: TransportEntry) => {
    onUpdate(updatedEntry);
    navigate('/');
  };

  if (!entry) {
    return <div className="p-8 text-center">Loading entry...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="mb-4 -ml-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Entries
        </Button>
        
        <Card className="border-none shadow-lg animate-in">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-primary">
              Edit Transport Entry
            </CardTitle>
            <CardDescription>Update transport entry details</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <TransportForm onSubmit={handleSubmit} initialData={entry} isEditing={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditEntryPage;
