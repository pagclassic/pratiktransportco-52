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
  Filter,
  TrendingUp,
  Truck,
  IndianRupee,
  Users,
  Clock
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransportEntry } from "@/types/transport";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { exportToExcel } from "@/utils/excelExport";
import { exportToPDF } from "@/utils/pdfExport";
import { exportToCSV } from "@/utils/csvExport";

interface ReportsDashboardProps {
  entries: TransportEntry[];
}

const ReportsDashboard = ({ entries }: ReportsDashboardProps) => {
  const [reportType, setReportType] = useState<string>("monthly");
  const [timeRange, setTimeRange] = useState<string>("3");

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
    return isWithinInterval(entryDate, { start, end });
  });

  // Calculate summary statistics
  const summaryStats = {
    totalEntries: filteredEntries.length,
    totalAmount: filteredEntries.reduce((sum, entry) => sum + entry.rentAmount, 0),
    unpaidAmount: filteredEntries
      .filter(entry => entry.balanceStatus !== "PAID")
      .reduce((sum, entry) => sum + (entry.rentAmount - (entry.advanceAmount || 0)), 0),
    paidAmount: filteredEntries
      .filter(entry => entry.balanceStatus === "PAID")
      .reduce((sum, entry) => sum + entry.rentAmount, 0),
    averageRentAmount: filteredEntries.length > 0 
      ? filteredEntries.reduce((sum, entry) => sum + entry.rentAmount, 0) / filteredEntries.length 
      : 0,
    uniqueVehicles: new Set(filteredEntries.map(entry => entry.vehicleNumber)).size,
    uniqueDrivers: new Set(filteredEntries.map(entry => entry.weight)).size,
  };

  // Calculate monthly statistics
  const monthlyStats = Array.from({ length: parseInt(timeRange) }, (_, i) => {
    const monthStart = startOfMonth(subMonths(end, i));
    const monthEnd = endOfMonth(monthStart);
    
    const monthEntries = filteredEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
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

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleExport("excel")}
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleExport("pdf")}
          >
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleExport("csv")}
          >
            <FileDown className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{summaryStats.totalEntries}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{summaryStats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <IndianRupee className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unpaid Amount</p>
                <p className="text-2xl font-bold text-red-600">₹{summaryStats.unpaidAmount.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rent</p>
                <p className="text-2xl font-bold text-blue-600">₹{Math.round(summaryStats.averageRentAmount).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle & Driver Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Unique Vehicles</span>
                </div>
                <span className="font-bold">{summaryStats.uniqueVehicles}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Unique Drivers</span>
                </div>
                <span className="font-bold">{summaryStats.uniqueDrivers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                  <span className="text-sm font-medium">{status}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((count / summaryStats.totalEntries) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyStats.map((month) => (
              <div key={month.month} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{month.month}</p>
                  <p className="text-sm text-muted-foreground">{month.totalEntries} entries</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{month.totalAmount.toLocaleString()}</p>
                  {month.unpaidAmount > 0 && (
                    <p className="text-sm text-red-600">₹{month.unpaidAmount.toLocaleString()} unpaid</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsDashboard;
