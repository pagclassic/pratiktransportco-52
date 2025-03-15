
import { TransportEntry } from "@/types/transport";
import { format } from "date-fns";

export const exportToExcel = (entries: TransportEntry[]) => {
  // Format the data for CSV
  const headers = [
    "Date",
    "Vehicle Number",
    "Driver",
    "Transport Name",
    "Place",
    "Rent Amount",
    "Advance",
    "Balance Amount",
    "Balance Status",
    "Balance Date",
  ];

  const rows = entries.map((entry) => {
    const balanceAmount = entry.rentAmount - (entry.advanceAmount || 0);
    
    return [
      format(entry.date, "dd/MM/yyyy"),
      entry.vehicleNumber,
      entry.driverName || "-",
      entry.transportName || "-",
      entry.place || "-",
      entry.rentAmount.toString(),
      entry.advanceAmount ? entry.advanceAmount.toString() : "-",
      balanceAmount.toString(),
      entry.balanceStatus,
      entry.balanceDate ? format(entry.balanceDate, "dd/MM/yyyy") : "-",
    ];
  });

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `transport-entries-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
