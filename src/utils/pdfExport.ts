import { TransportEntry } from "@/types/transport";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPDF = (entries: TransportEntry[], startDate: Date, endDate: Date) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text("Transport Entries Report", 14, 15);

  // Add date range
  doc.setFontSize(12);
  doc.text(
    `Period: ${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`,
    14,
    25
  );

  // Add table
  const tableData = entries.map((entry) => [
    format(entry.date, "dd/MM/yyyy"),
    entry.vehicleNumber,
    entry.driverName || "-",
    entry.transportName || "-",
    entry.place || "-",
    `₹${entry.rentAmount.toLocaleString()}`,
    entry.advanceAmount ? `₹${entry.advanceAmount.toLocaleString()}` : "-",
    `₹${(entry.rentAmount - (entry.advanceAmount || 0)).toLocaleString()}`,
    entry.balanceStatus,
    entry.balanceDate ? format(entry.balanceDate, "dd/MM/yyyy") : "-",
  ]);

  (doc as any).autoTable({
    startY: 35,
    head: [
      [
        "Date",
        "Vehicle",
        "Driver",
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
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
  });

  // Add summary
  const totalAmount = entries.reduce((sum, entry) => sum + entry.rentAmount, 0);
  const unpaidAmount = entries
    .filter((entry) => entry.balanceStatus !== "PAID")
    .reduce((sum, entry) => sum + (entry.rentAmount - (entry.advanceAmount || 0)), 0);

  const finalY = (doc as any).lastAutoTable.finalY || 35;
  doc.setFontSize(10);
  doc.text(`Total Entries: ${entries.length}`, 14, finalY + 10);
  doc.text(`Total Amount: ₹${totalAmount.toLocaleString()}`, 14, finalY + 15);
  doc.text(`Unpaid Amount: ₹${unpaidAmount.toLocaleString()}`, 14, finalY + 20);

  // Save the PDF
  doc.save(`transport-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}; 