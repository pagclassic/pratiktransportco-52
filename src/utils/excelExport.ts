
import { TransportEntry } from "@/types/transport";
import { format } from "date-fns";

export const exportToExcel = (entries: TransportEntry[]) => {
  // Calculate summary statistics
  const totalAmount = entries.reduce((sum, entry) => sum + entry.rentAmount, 0);
  const unpaidAmount = entries
    .filter(entry => entry.balanceStatus !== "PAID")
    .reduce((sum, entry) => sum + (entry.rentAmount - (entry.advanceAmount || 0)), 0);
  const paidAmount = entries
    .filter(entry => entry.balanceStatus === "PAID")
    .reduce((sum, entry) => sum + entry.rentAmount, 0);
  const averageAmount = entries.length > 0 ? totalAmount / entries.length : 0;
  const uniqueVehicles = new Set(entries.map(entry => entry.vehicleNumber)).size;
  const uniqueWeights = new Set(entries.map(entry => entry.weight).filter(Boolean)).size; // Changed from drivers

  // Format the data for CSV
  const headers = [
    "Date",
    "Vehicle Number",
    "Weight of Goods", // Changed from Driver
    "Transport Name",
    "Place",
    "Rent Amount (₹)",
    "Advance Amount (₹)",
    "Balance Amount (₹)",
    "Balance Status",
    "Balance Date",
  ];

  const rows = entries.map((entry) => {
    const balanceAmount = entry.rentAmount - (entry.advanceAmount || 0);
    
    return [
      format(new Date(entry.date), "dd/MM/yyyy"),
      entry.vehicleNumber,
      entry.weight || "-", // Changed from driverName
      entry.transportName || "-",
      entry.place || "-",
      entry.rentAmount.toLocaleString(),
      entry.advanceAmount ? entry.advanceAmount.toLocaleString() : "-",
      balanceAmount.toLocaleString(),
      entry.balanceStatus,
      entry.balanceDate ? format(new Date(entry.balanceDate), "dd/MM/yyyy") : "-",
    ];
  });

  // Add summary section
  const summarySection = [
    ["", "", "", "", "", "", "", "", "", ""],
    ["Summary Statistics", "", "", "", "", "", "", "", "", ""],
    ["Total Entries:", entries.length, "", "", "", "", "", "", "", ""],
    ["Total Amount:", `₹${totalAmount.toLocaleString()}`, "", "", "", "", "", "", "", ""],
    ["Paid Amount:", `₹${paidAmount.toLocaleString()}`, "", "", "", "", "", "", "", ""],
    ["Unpaid Amount:", `₹${unpaidAmount.toLocaleString()}`, "", "", "", "", "", "", "", ""],
    ["Remaining Balance:", `₹${unpaidAmount.toLocaleString()}`, "", "", "", "", "", "", "", ""], // Added remaining balance
    ["Average Amount:", `₹${Math.round(averageAmount).toLocaleString()}`, "", "", "", "", "", "", "", ""],
    ["Unique Vehicles:", uniqueVehicles, "", "", "", "", "", "", "", ""],
    ["Unique Weights:", uniqueWeights, "", "", "", "", "", "", "", ""], // Changed from Drivers
  ];

  // Status distribution
  const statusDistribution = entries.reduce((acc, entry) => {
    acc[entry.balanceStatus] = (acc[entry.balanceStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusSection = [
    ["", "", "", "", "", "", "", "", "", ""],
    ["Status Distribution", "", "", "", "", "", "", "", "", ""],
    ...Object.entries(statusDistribution).map(([status, count]) => [
      `${status}:`,
      count,
      `${Math.round((count / entries.length) * 100)}%`,
      "", "", "", "", "", "", ""
    ])
  ];

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(",")),
    ...summarySection.map(row => row.join(",")),
    ...statusSection.map(row => row.join(","))
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `transport-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
