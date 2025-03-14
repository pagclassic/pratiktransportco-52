
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
import { AlertCircle, Truck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TransportEntriesProps {
  entries: TransportEntry[];
}

const TransportEntries = ({ entries }: TransportEntriesProps) => {
  if (entries.length === 0) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700">No entries yet</AlertTitle>
        <AlertDescription className="text-amber-600">
          You haven't created any transport entries yet. Use the form tab to create your first entry.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className="h-[500px] rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-slate-50 z-10">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Vehicle Number</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Place</TableHead>
            <TableHead>Rent Amount</TableHead>
            <TableHead>Advance</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id} className="hover:bg-slate-50/80">
              <TableCell>{format(entry.date, "dd/MM/yyyy")}</TableCell>
              <TableCell className="font-medium flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-slate-400" />
                {entry.vehicleNumber}
              </TableCell>
              <TableCell>{entry.driverName || "—"}</TableCell>
              <TableCell>{entry.place || "—"}</TableCell>
              <TableCell className="font-medium">₹{entry.rentAmount.toLocaleString()}</TableCell>
              <TableCell>
                {entry.advanceAmount ? `₹${entry.advanceAmount.toLocaleString()}` : "—"}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default TransportEntries;
