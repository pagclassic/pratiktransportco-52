
export interface TransportEntry {
  id: string;
  date: Date;
  vehicleNumber: string;
  weight: string; // Changed from driverName
  driverMobile: string;
  place: string;
  transportName: string;
  rentAmount: number;
  advanceAmount: number | null;
  advanceDate: Date | null;
  advanceType: 'Cash' | 'Bank Transfer' | 'Check' | 'UPI';
  balanceStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
  balanceDate: Date | null;
}
