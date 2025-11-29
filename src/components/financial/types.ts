// Financial types and interfaces

export interface Transaction {
  id: string;
  barangayId: string;
  transactionNumber: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string | null;
  transactionDate: string;
  paidBy: string | null;
  receivedBy: string | null;
  referenceNumber: string | null;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  thisMonthIncome: number;
  thisMonthExpenses: number;
  thisMonthNet: number;
  incomeChange: number;
  expenseChange: number;
  netChange: number;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
  totalTransactions: number;
}

export interface FormData {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  transaction_date: string;
  paid_by: string;
  received_by: string;
  reference_number: string;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  notes: string;
}

export type ModalMode = 'create' | 'edit' | 'view' | 'delete';

export type SortField = 'transactionNumber' | 'type' | 'category' | 'amount' | 'transactionDate' | 'status';
export type SortDirection = 'asc' | 'desc';
