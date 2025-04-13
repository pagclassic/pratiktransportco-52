
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
import { TransportCompany } from '@/types/transport';

interface EditCompanyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCompany: TransportCompany | null;
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const EditCompanyDialog: React.FC<EditCompanyDialogProps> = ({
  isOpen,
  onOpenChange,
  editingCompany,
  onInputChange,
  onSubmit,
  isLoading
}) => {
  if (!editingCompany) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transport Company</DialogTitle>
          <DialogDescription>
            Update transport company details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="edit-name" className="text-sm font-medium">Company Name</label>
            <Input 
              id="edit-name" 
              value={editingCompany.name} 
              onChange={e => onInputChange('name', e.target.value)} 
              placeholder="Transport Co. Name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-email" className="text-sm font-medium">Email</label>
            <Input 
              id="edit-email" 
              type="email"
              value={editingCompany.email} 
              onChange={e => onInputChange('email', e.target.value)} 
              placeholder="email@example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Company'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCompanyDialog;
