
import { TransportEntry } from "@/types/transport";
import { format } from "date-fns";

export const exportToCSV = (entries: TransportEntry[]) => {
  // Define headers
  const headers = [
    "Date",
    "Vehicle Number",
    "Weight of Goods", // Changed from Driver
    "Transport Name",
    "Place",
    "Rent Amount",
    "Advance Amount",
    "Balance Amount",
    "Balance Status",
    "Balance Date",
  ];

  // Format data rows
  const rows = entries.map((entry) => {
    const balanceAmount = entry.rentAmount - (entry.advanceAmount || 0);
    
    return [
      format(entry.date, "dd/MM/yyyy"),
      entry.vehicleNumber,
      entry.weight || "-", // Changed from driverName
      entry.transportName || "-",
      entry.place || "-",
      entry.rentAmount.toString(),
      entry.advanceAmount ? entry.advanceAmount.toString() : "-",
      balanceAmount.toString(),
      entry.balanceStatus,
      entry.balanceDate ? format(entry.balanceDate, "dd/MM/yyyy") : "-",
    ];
  });

  // Add summary row
  const totalAmount = entries.reduce((sum, entry) => sum + entry.rentAmount, 0);
  const unpaidAmount = entries
    .filter((entry) => entry.balanceStatus !== "PAID")
    .reduce((sum, entry) => sum + (entry.rentAmount - (entry.advanceAmount || 0)), 0);

  const summaryRow = [
    "",
    "",
    "",
    "",
    "",
    "Total Amount",
    "",
    "Unpaid Amount",
    "",
    "",
  ];

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
    "",
    summaryRow.join(","),
    "",
    `Total Entries,${entries.length}`,
    `Total Amount,${totalAmount}`,
    `Unpaid Amount,${unpaidAmount}`,
  ].join("\n");

  // Create and trigger download
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
