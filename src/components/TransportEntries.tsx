
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TransportEntriesProps {
  entries: TransportEntry[];
}

const TransportEntries = ({ entries }: TransportEntriesProps) => {
  if (entries.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No entries</AlertTitle>
        <AlertDescription>
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
            <TableRow key={entry.id}>
              <TableCell>{format(entry.date, "dd/MM/yyyy")}</TableCell>
              <TableCell className="font-medium">{entry.vehicleNumber}</TableCell>
              <TableCell>{entry.driverName || "—"}</TableCell>
              <TableCell>{entry.place || "—"}</TableCell>
              <TableCell>₹{entry.rentAmount.toLocaleString()}</TableCell>
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
