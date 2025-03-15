
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransportEntry } from "@/types/transport";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Download, Edit, FileSpreadsheet, MoreHorizontal, Plus, Search, Trash, Truck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excelExport";

interface TransportEntriesProps {
  entries: TransportEntry[];
  onDelete: (id: string) => void;
}

const TransportEntries = ({ entries, onDelete }: TransportEntriesProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const filteredEntries = entries.filter(entry => 
    entry.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.transportName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (filteredEntries.length === 0) {
      toast({
        title: "No entries to export",
        description: "Add some entries first before exporting.",
        variant: "destructive"
      });
      return;
    }
    
    exportToExcel(filteredEntries);
    toast({
      title: "Export successful",
      description: "Your transport entries have been exported to Excel.",
    });
  };

  const handleAddNew = () => {
    navigate('/add-entry');
  };

  const handleEdit = (id: string) => {
    navigate(`/edit-entry/${id}`);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    toast({
      title: "Entry deleted",
      description: "The transport entry has been successfully deleted.",
    });
  };

  // Helper function to calculate balance amount
  const calculateBalance = (rentAmount: number, advanceAmount: number | null): number => {
    return rentAmount - (advanceAmount || 0);
  };

  if (entries.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div></div>
          <Button 
            onClick={handleAddNew}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add New Entry
          </Button>
        </div>
        
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700">No entries yet</AlertTitle>
          <AlertDescription className="text-amber-600">
            You haven't created any transport entries yet. Use the Add New Entry button to create your first entry.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2 items-center">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search entries..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleExport}
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
          
          <Button 
            onClick={handleAddNew}
            className="gap-2 flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4" /> Add New Entry
          </Button>
        </div>
      </div>
      
      {/* Enhanced scrolling container with horizontal scroll support */}
      <div className="border rounded-md overflow-hidden">
        <ScrollArea className="h-[500px]">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Vehicle Number</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Transport Name</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Rent Amount</TableHead>
                  <TableHead>Advance</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Balance Paid Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                      No entries found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-slate-50/80 group">
                      <TableCell>{format(entry.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-slate-400" />
                        {entry.vehicleNumber}
                      </TableCell>
                      <TableCell>{entry.driverName || "—"}</TableCell>
                      <TableCell>{entry.transportName || "—"}</TableCell>
                      <TableCell>{entry.place || "—"}</TableCell>
                      <TableCell className="font-medium">₹{entry.rentAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        {entry.advanceAmount ? `₹${entry.advanceAmount.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{calculateBalance(entry.rentAmount, entry.advanceAmount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {entry.balanceDate ? format(entry.balanceDate, "dd/MM/yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            entry.balanceStatus === "PAID" 
                              ? "default" 
                              : entry.balanceStatus === "PARTIAL" 
                                ? "outline" 
                                : "destructive"
                          }
                          className={
                            entry.balanceStatus === "PAID" 
                              ? "bg-green-100 text-green-800 hover:bg-green-200" 
                              : entry.balanceStatus === "PARTIAL" 
                                ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200" 
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {entry.balanceStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(entry.id)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirm deletion</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this entry? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <DialogClose asChild>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => handleDelete(entry.id)}
                                    >
                                      Delete
                                    </Button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TransportEntries;
