import TransportForm from "@/components/TransportForm";
import { TransportEntry } from "@/types/transport";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTransportEntries, updateTransportEntry } from "@/services/transportService";

const EditEntryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery<TransportEntry[]>({
    queryKey: ['transportEntries'],
    queryFn: fetchTransportEntries
  });

  const entry = data.find(e => e.id === id);
  
  const handleSubmit = async (updatedEntry: TransportEntry) => {
    const result = await updateTransportEntry(updatedEntry);
    if (result) {
      queryClient.invalidateQueries({ queryKey: ['transportEntries'] });
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!entry) {
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
            <CardContent className="p-6">
              <div className="text-center py-8">
                Entry not found. The entry may have been deleted.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
