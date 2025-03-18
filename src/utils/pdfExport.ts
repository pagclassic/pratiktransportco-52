
import { TransportEntry } from "@/types/transport";
import { format } from "date-fns";
import jsPDF from "jspdf";
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export const exportToPDF = (entries: TransportEntry[], startDate: Date, endDate: Date) => {
  const doc = new jsPDF();

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

  // Add title and header
  doc.setFontSize(20);
  doc.setTextColor(41, 128, 185); // Primary blue color
  doc.text("Transport Entries Report", 14, 20);

  // Add date range
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(
    `Period: ${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`,
    14,
    30
  );

  // Add summary statistics
  let yPos = 40;
  doc.setFontSize(16);
  doc.setTextColor(41, 128, 185);
  doc.text("Summary Statistics", 14, yPos);
  
  doc.setFontSize(10);
  doc.setTextColor(60);
  yPos += 10;
  
  const summaryStats = [
    { label: "Total Entries", value: entries.length.toString() },
    { label: "Total Amount", value: `₹${totalAmount.toLocaleString()}` },
    { label: "Paid Amount", value: `₹${paidAmount.toLocaleString()}` },
    { label: "Unpaid Amount", value: `₹${unpaidAmount.toLocaleString()}` },
    { label: "Average Amount", value: `₹${Math.round(averageAmount).toLocaleString()}` },
    { label: "Unique Vehicles", value: uniqueVehicles.toString() },
    { label: "Unique Weights", value: uniqueWeights.toString() }, // Changed from drivers
  ];

  // Create summary table
  (doc as any).autoTable({
    startY: yPos,
    head: [["Metric", "Value"]],
    body: summaryStats.map(stat => [stat.label, stat.value]),
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    margin: { left: 14 },
    tableWidth: 180, // Increase table width
  });

  // Status Distribution
  const statusDistribution = entries.reduce((acc, entry) => {
    acc[entry.balanceStatus] = (acc[entry.balanceStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.setTextColor(41, 128, 185);
  doc.text("Status Distribution", 14, yPos);

  // Create status distribution table
  (doc as any).autoTable({
    startY: yPos + 5,
    head: [["Status", "Count", "Percentage"]],
    body: Object.entries(statusDistribution).map(([status, count]) => [
      status,
      count,
      `${Math.round((count / entries.length) * 100)}%`,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    margin: { left: 14 },
    tableWidth: 180, // Increase table width
  });

  // Entries Table
  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.setTextColor(41, 128, 185);
  doc.text("Detailed Entries", 14, yPos);

  // Add entries table with fixed currency symbols
  const tableData = entries.map((entry) => [
    format(new Date(entry.date), "dd/MM/yyyy"),
    entry.vehicleNumber,
    entry.weight || "-", // Changed from driverName
    entry.transportName || "-",
    entry.place || "-",
    `₹${entry.rentAmount.toLocaleString()}`, // Fix currency format
    entry.advanceAmount ? `₹${entry.advanceAmount.toLocaleString()}` : "-", // Fix currency format
    `₹${(entry.rentAmount - (entry.advanceAmount || 0)).toLocaleString()}`, // Fix currency format
    entry.balanceStatus,
    entry.balanceDate ? format(new Date(entry.balanceDate), "dd/MM/yyyy") : "-",
  ]);

  (doc as any).autoTable({
    startY: yPos + 5,
    head: [
      [
        "Date",
        "Vehicle",
        "Weight", // Changed from Driver
        "Transport",
        "Place",
        "Rent",
        "Advance",
        "Balance",
        "Status",
        "Paid Date",
      ],
    ],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak', // Handle text overflow
    },
    columnStyles: {
      5: { halign: 'right', cellWidth: 20 }, // Rent amount column
      6: { halign: 'right', cellWidth: 20 }, // Advance amount column
      7: { halign: 'right', cellWidth: 20 }, // Balance amount column
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    margin: { left: 10, right: 10 }, // Adjust margins to fit content
    tableWidth: 'auto', // Let table adapt to content
  });

  // Save the PDF
  doc.save(`transport-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
