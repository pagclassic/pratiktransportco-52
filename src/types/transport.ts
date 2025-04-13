
export interface TransportEntry {
  id: string;
  date: Date;
  vehicleNumber: string;
  weight: string;
  driverMobile: string;
  place: string;
  transportName: string;
  rentAmount: number;
  advanceAmount: number | null;
  advanceDate: Date | null;
  advanceType: 'Cash' | 'Bank Transfer' | 'Check' | 'UPI';
  balanceStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
  balanceDate: Date | null;
  companyId?: string;
}

export interface TransportCompany {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Admin {
  email: string;
  isLoggedIn: boolean;
}

export interface User {
  email: string;
  companyId?: string;
  companyName?: string;
  isAdmin?: boolean;
}
