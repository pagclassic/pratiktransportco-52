import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileDown,
  Calendar,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransportEntry } from "@/types/transport";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { exportToExcel } from "@/utils/excelExport";
import { exportToPDF } from "@/utils/pdfExport";
import { exportToCSV } from "@/utils/csvExport";

interface ReportsDashboardProps {
  entries: TransportEntry[];
}

const ReportsDashboard = ({ entries }: ReportsDashboardProps) => {
  const [reportType, setReportType] = useState<string>("monthly");
  const [timeRange, setTimeRange] = useState<string>("3months");

  // Calculate date range based on selection
  const getDateRange = () => {
    const end = new Date();
    const start = subMonths(end, parseInt(timeRange));
    return { start, end };
  };

  const { start, end } = getDateRange();

  // Filter entries based on date range
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= start && entryDate <= end;
  });

  // Calculate monthly statistics
  const monthlyStats = Array.from({ length: parseInt(timeRange) }, (_, i) => {
    const monthStart = startOfMonth(subMonths(end, i));
    const monthEnd = endOfMonth(monthStart);
    
    const monthEntries = filteredEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    return {
      month: format(monthStart, "MMM yyyy"),
      totalEntries: monthEntries.length,
      totalAmount: monthEntries.reduce((sum, entry) => sum + entry.rentAmount, 0),
      unpaidAmount: monthEntries
        .filter(entry => entry.balanceStatus !== "PAID")
        .reduce((sum, entry) => sum + (entry.rentAmount - (entry.advanceAmount || 0)), 0),
    };
  }).reverse();

  // Calculate status distribution
  const statusDistribution = filteredEntries.reduce((acc, entry) => {
    acc[entry.balanceStatus] = (acc[entry.balanceStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExport = (format: "excel" | "pdf" | "csv") => {
    switch (format) {
      case "excel":
        exportToExcel(filteredEntries);
        break;
      case "pdf":
        exportToPDF(filteredEntries, start, end);
        break;
      case "csv":
        exportToCSV(filteredEntries);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 w-full sm:w-auto">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly Summary</SelectItem>
              <SelectItem value="status">Status Distribution</SelectItem>
              <SelectItem value="vehicle">Vehicle-wise</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Month</SelectItem>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => handleExport("excel")}
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => handleExport("pdf")}
          >
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => handleExport("csv")}
          >
            <FileDown className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEntries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{filteredEntries.reduce((sum, entry) => sum + entry.rentAmount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Amount</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{filteredEntries
                .filter(entry => entry.balanceStatus !== "PAID")
                .reduce((sum, entry) => sum + (entry.rentAmount - (entry.advanceAmount || 0)), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {/* Here you would add your chart component */}
            {/* For example, using recharts or chart.js */}
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Chart visualization will be added here
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(statusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="font-medium">{status}</span>
                <span className="text-lg font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsDashboard; 