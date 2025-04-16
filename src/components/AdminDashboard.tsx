
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { TransportCompany } from '@/types/transport';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchTransportCompanies, 
  createTransportCompany, 
  updateTransportCompany, 
  deleteTransportCompany,
  toggleTransportCompanyStatus 
} from '@/services/transportService';
import CompanyTable from './companies/CompanyTable';
import AddCompanyDialog from './companies/AddCompanyDialog';
import EditCompanyDialog from './companies/EditCompanyDialog';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<TransportCompany[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', email: '', password: '' });
  const [editingCompany, setEditingCompany] = useState<TransportCompany | null>(null);
  
  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData || !JSON.parse(adminData).isLoggedIn) {
      navigate('/admin');
      return;
    }
    
    loadCompanies();
  }, [navigate]);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const companiesData = await fetchTransportCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load transport companies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const success = await toggleTransportCompanyStatus(id, !currentStatus);
      if (success) {
        setCompanies(companies.map(company => {
          if (company.id === id) {
            return { ...company, isActive: !currentStatus };
          }
          return company;
        }));
        toast.success(`${!currentStatus ? 'Activated' : 'Paused'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling company status:', error);
    }
  };

  const handleNewCompanyInputChange = (field: string, value: string) => {
    setNewCompany({ ...newCompany, [field]: value });
  };

  const handleEditingCompanyInputChange = (field: string, value: string) => {
    if (editingCompany) {
      setEditingCompany({ ...editingCompany, [field]: value });
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.email || !newCompany.password) {
      toast.error('All fields are required');
      return;
    }

    try {
      setIsLoading(true);
      
      const newCompanyEntry: TransportCompany = {
        id: '',
        name: newCompany.name,
        email: newCompany.email,
        isActive: true,
        createdAt: new Date()
      };
      
      const createdCompany = await createTransportCompany(newCompanyEntry);
      
      if (createdCompany) {
        const { error: credentialsError } = await supabase
          .from('transport_credentials')
          .insert({
            company_id: createdCompany.id,
            email: newCompany.email,
            password_hash: newCompany.password
          });

        if (credentialsError) {
          console.error('Error creating credentials:', credentialsError);
          toast.error('Failed to create transport credentials');
          await deleteTransportCompany(createdCompany.id);
          return;
        }
        
        setCompanies([createdCompany, ...companies]);
        setNewCompany({ name: '', email: '', password: '' });
        setIsAddDialogOpen(false);
        toast.success('Company added successfully');
      }
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Failed to add transport company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCompany = async () => {
    if (!editingCompany || !editingCompany.name || !editingCompany.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setIsLoading(true);
      const success = await updateTransportCompany(editingCompany);
      
      if (success) {
        setCompanies(companies.map(company => {
          if (company.id === editingCompany.id) {
            return editingCompany;
          }
          return company;
        }));
        
        setIsEditDialogOpen(false);
        setEditingCompany(null);
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update transport company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    const companyToDelete = companies.find(company => company.id === id);
    if (!companyToDelete) return;

    if (confirm(`Are you sure you want to delete ${companyToDelete.name}?`)) {
      try {
        setIsLoading(true);
        
        const success = await deleteTransportCompany(id);
        
        if (success) {
          setCompanies(companies.filter(company => company.id !== id));
          toast.success('Company deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting company:', error);
        toast.error('Failed to delete transport company');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">Admin Dashboard</h1>
              <p className="text-slate-500">Manage transport companies</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </header>

        <Card className="border-none shadow-lg mb-6">
          <CardHeader className="bg-primary/5 rounded-t-lg flex flex-row justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-primary">
                Transport Companies
              </CardTitle>
              <CardDescription>Add, edit, or pause transport companies</CardDescription>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Add Company
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardHeader>
          <CardContent className="p-6">
            <CompanyTable 
              companies={companies} 
              isLoading={isLoading}
              onEdit={(company) => {
                setEditingCompany(company);
                setIsEditDialogOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteCompany}
            />
          </CardContent>
        </Card>
      </div>

      <AddCompanyDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        newCompany={newCompany}
        onInputChange={handleNewCompanyInputChange}
        onSubmit={handleAddCompany}
        isLoading={isLoading}
      />

      <EditCompanyDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingCompany={editingCompany}
        onInputChange={handleEditingCompanyInputChange}
        onSubmit={handleEditCompany}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminDashboard;
