// Type Definitions: Financial Engine, Invoices, Expenses, Cards & Work Shifts

export interface WorkShift {
  timestamp?: number;
  id: string;
  date: string;
  description?: string;
  roleTitle?: string;
  startTime: string;
  endTime: string;
  hours: number;
  hourlyRate?: number;
  rateMultiplier?: number;
  totalEarned?: number;
  notes?: string;
  location?: string;
}

export interface Expense {
  peerName?: string;
  splitRatio?: number;
  splitWith?: string;
  splitType?: 'equal' | 'custom';
  owedToMe?: number;
  iOwe?: number;
  settled?: boolean;
  timestamp?: number;
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  paymentMethod?: string;
  notes?: string;
  tags?: string[];
}

export interface CreditCard {
  id: string;
  cardName: string;
  statementBalance: number;
  paymentsMade: number;
  dueDate: string;
  creditLimit?: number;
  apr?: number;
  minPayment?: number;
  colorTheme?: string;
  notes?: string;
  statementCloseDate?: string;
}

export interface Invoice {
  id: string;
  vendor: string;
  date: string;
  description?: string;
  amount: number;
  fileBase64?: string;
  fileType: string;
  invoiceNumber?: string;
  category?: string;
  taxAmount?: number;
  status?: 'Paid' | 'Pending' | 'Reimbursed';
  notes?: string;
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  currency: string;
  billingCycle: 'Monthly' | 'Yearly' | 'One-time';
  renewalDate: string;
  category?: string;
}

export interface TechAsset {
  id: string;
  name: string;
  purchaseDate: string;
  warrantyExpiry: string;
  tradeInValue: number;
}

export interface VehicleCost {
  id: string;
  vehicleName: string;
  purchasePrice: number;
  monthlyFinance?: number;
  depreciation?: number;
  insurance: number;
  servicing?: number;
  maintenance?: number;
  fuel: number;
  parking?: number;
  currency: string;
}
