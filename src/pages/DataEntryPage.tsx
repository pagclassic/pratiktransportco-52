
import TransportForm from "@/components/TransportForm";
import { TransportEntry } from "@/types/transport";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createTransportEntry } from "@/services/transportService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const DataEntryPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Get the company ID from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      setCompanyId(user.companyId);
    } else {
      // If no user data is found, redirect to login
      toast.error('User data not found. Please log in.');
      navigate('/login');
    }
  }, [navigate]);
  
  const handleSubmit = async (formData) => {
    try {
      if (!companyId) {
        toast.error('Company ID not found. Please log in again.');
        navigate('/login');
        return;
      }
      
      // Explicitly set the company ID in the form data
      const entryWithCompany = {
        ...formData,
        companyId: companyId
      } as TransportEntry;
      
      console.log('Submitting entry with company ID:', entryWithCompany);
      
      const newEntry = await createTransportEntry(entryWithCompany);
      if (newEntry) {
        await queryClient.invalidateQueries({ queryKey: ['transportEntries'] });
        toast.success('Entry created successfully');
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry');
    }
  };

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
              Add New Transport Entry
            </CardTitle>
            <CardDescription>Create a new transport entry with vehicle and payment details</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <TransportForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataEntryPage;
