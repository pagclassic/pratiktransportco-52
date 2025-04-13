
import React from 'react';
import { 
  Check, 
  PauseCircle, 
  PlayCircle,
  Edit,
  Trash2,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TransportCompany } from '@/types/transport';

interface CompanyTableProps {
  companies: TransportCompany[];
  isLoading: boolean;
  onEdit: (company: TransportCompany) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

const CompanyTable: React.FC<CompanyTableProps> = ({ 
  companies, 
  isLoading, 
  onEdit, 
  onToggleStatus, 
  onDelete 
}) => {
  return (
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
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              Loading transport companies...
            </TableCell>
          </TableRow>
        ) : companies.length === 0 ? (
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
                    onClick={() => onEdit(company)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`h-8 w-8 p-0 ${company.isActive ? 'text-amber-500 hover:text-amber-600' : 'text-green-500 hover:text-green-600'}`}
                    onClick={() => onToggleStatus(company.id, company.isActive)}
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
                    onClick={() => onDelete(company.id)}
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
  );
};

export default CompanyTable;
