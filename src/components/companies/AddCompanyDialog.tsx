
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

interface AddCompanyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newCompany: { name: string; email: string; password: string };
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const AddCompanyDialog: React.FC<AddCompanyDialogProps> = ({
  isOpen,
  onOpenChange,
  newCompany,
  onInputChange,
  onSubmit,
  isLoading
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onChange={e => onInputChange('name', e.target.value)} 
              placeholder="Transport Co. Name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input 
              id="email" 
              type="email"
              value={newCompany.email} 
              onChange={e => onInputChange('email', e.target.value)} 
              placeholder="email@example.com"
            />
            <p className="text-xs text-muted-foreground">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Email must be unique for each company
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <Input 
              id="password" 
              type="password"
              value={newCompany.password} 
              onChange={e => onInputChange('password', e.target.value)} 
              placeholder="••••••"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Company'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompanyDialog;
