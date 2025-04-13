
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  PauseCircle, 
  PlayCircle, 
  LogOut, 
  Plus, 
  Users, 
  Truck,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TransportCompany } from '@/types/transport';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<TransportCompany[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', email: '', password: '' });
  const [editingCompany, setEditingCompany] = useState<TransportCompany | null>(null);
  
  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('admin');
    if (!adminData || !JSON.parse(adminData).isLoggedIn) {
      navigate('/admin');
      return;
    }
    
    // Load companies from localStorage or initialize with sample data
    const storedCompanies = localStorage.getItem('transportCompanies');
    if (storedCompanies) {
      setCompanies(JSON.parse(storedCompanies).map((company: any) => ({
        ...company,
        createdAt: new Date(company.createdAt)
      })));
    } else {
      // Sample data
      const sampleCompanies: TransportCompany[] = [
        {
          id: '1',
          name: 'Pratik Transport Co',
          email: 'pratik@example.com',
          isActive: true,
          createdAt: new Date()
        }
      ];
      setCompanies(sampleCompanies);
      localStorage.setItem('transportCompanies', JSON.stringify(sampleCompanies));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const saveCompanies = (updatedCompanies: TransportCompany[]) => {
    setCompanies(updatedCompanies);
    localStorage.setItem('transportCompanies', JSON.stringify(updatedCompanies));
  };

  const handleToggleStatus = (id: string) => {
    const updatedCompanies = companies.map(company => {
      if (company.id === id) {
        const newStatus = !company.isActive;
        toast.success(`${company.name} ${newStatus ? 'activated' : 'paused'} successfully`);
        return { ...company, isActive: newStatus };
      }
      return company;
    });
    saveCompanies(updatedCompanies);
  };

  const handleAddCompany = () => {
    if (!newCompany.name || !newCompany.email || !newCompany.password) {
      toast.error('All fields are required');
      return;
    }

    const newCompanyEntry: TransportCompany = {
      id: Date.now().toString(),
      name: newCompany.name,
      email: newCompany.email,
      isActive: true,
      createdAt: new Date()
    };

    // In a real app, we'd hash the password and store it securely
    // For demo purposes, we're storing user credentials separately
    const userCredentials = {
      email: newCompany.email,
      password: newCompany.password,
      companyId: newCompanyEntry.id
    };
    
    const userCredentialsArray = JSON.parse(localStorage.getItem('userCredentials') || '[]');
    userCredentialsArray.push(userCredentials);
    localStorage.setItem('userCredentials', JSON.stringify(userCredentialsArray));
    
    const updatedCompanies = [...companies, newCompanyEntry];
    saveCompanies(updatedCompanies);
    
    setNewCompany({ name: '', email: '', password: '' });
    setIsAddDialogOpen(false);
    toast.success('Transport company added successfully');
  };

  const handleEditCompany = () => {
    if (!editingCompany || !editingCompany.name || !editingCompany.email) {
      toast.error('Name and email are required');
      return;
    }

    const updatedCompanies = companies.map(company => {
      if (company.id === editingCompany.id) {
        return editingCompany;
      }
      return company;
    });

    saveCompanies(updatedCompanies);
    setIsEditDialogOpen(false);
    setEditingCompany(null);
    toast.success('Transport company updated successfully');
  };

  const handleDeleteCompany = (id: string) => {
    const companyToDelete = companies.find(company => company.id === id);
    if (!companyToDelete) return;

    if (confirm(`Are you sure you want to delete ${companyToDelete.name}?`)) {
      const updatedCompanies = companies.filter(company => company.id !== id);
      saveCompanies(updatedCompanies);
      
      // Also remove user credentials
      const userCredentialsArray = JSON.parse(localStorage.getItem('userCredentials') || '[]');
      const updatedCredentials = userCredentialsArray.filter((cred: any) => cred.companyId !== id);
      localStorage.setItem('userCredentials', JSON.stringify(updatedCredentials));
      
      toast.success('Transport company deleted successfully');
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Transport Company</DialogTitle>
                  <DialogDescription>
                    Create a new transport company account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Company Name</label>
                    <Input 
                      id="name" 
                      value={newCompany.name} 
                      onChange={e => setNewCompany({...newCompany, name: e.target.value})} 
                      placeholder="Transport Co. Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input 
                      id="email" 
                      type="email"
                      value={newCompany.email} 
                      onChange={e => setNewCompany({...newCompany, email: e.target.value})} 
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <Input 
                      id="password" 
                      type="password"
                      value={newCompany.password} 
                      onChange={e => setNewCompany({...newCompany, password: e.target.value})} 
                      placeholder="••••••"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCompany}>Add Company</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Transport Company</DialogTitle>
                  <DialogDescription>
                    Update transport company details
                  </DialogDescription>
                </DialogHeader>
                {editingCompany && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="edit-name" className="text-sm font-medium">Company Name</label>
                      <Input 
                        id="edit-name" 
                        value={editingCompany.name} 
                        onChange={e => setEditingCompany({...editingCompany, name: e.target.value})} 
                        placeholder="Transport Co. Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="edit-email" className="text-sm font-medium">Email</label>
                      <Input 
                        id="edit-email" 
                        type="email"
                        value={editingCompany.email} 
                        onChange={e => setEditingCompany({...editingCompany, email: e.target.value})} 
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleEditCompany}>Update Company</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No transport companies added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          {company.name}
                        </div>
                      </TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {company.isActive ? (
                            <>
                              <Check className="h-3 w-3" /> Active
                            </>
                          ) : (
                            <>
                              <PauseCircle className="h-3 w-3" /> Paused
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setEditingCompany(company);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-8 w-8 p-0 ${company.isActive ? 'text-amber-500 hover:text-amber-600' : 'text-green-500 hover:text-green-600'}`}
                            onClick={() => handleToggleStatus(company.id)}
                          >
                            {company.isActive ? (
                              <PauseCircle className="h-4 w-4" />
                            ) : (
                              <PlayCircle className="h-4 w-4" />
                            )}
                            <span className="sr-only">{company.isActive ? 'Pause' : 'Activate'}</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteCompany(company.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
