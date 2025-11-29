// Financial utility functions and constants

import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export const INCOME_CATEGORIES = [
  'Barangay Clearance Fee',
  'Business Permit Fee',
  'Cedula Fee',
  'Rental Income',
  'Donation',
  'Government Fund',
  'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Utilities',
  'Salaries',
  'Maintenance',
  'Events',
  'Equipment',
  'Transportation',
  'Other Expense',
];

export const initialFormData = {
  type: 'income' as const,
  category: '',
  amount: 0,
  description: '',
  transaction_date: new Date().toISOString().split('T')[0],
  paid_by: '',
  received_by: '',
  reference_number: '',
  status: 'completed' as const,
  notes: '',
};

export const getCategories = (type: string) => {
  if (type === 'income') return INCOME_CATEGORIES;
  if (type === 'expense') return EXPENSE_CATEGORIES;
  return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
};

export const getTypeColor = (type: string) => {
  return type === 'income'
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'refunded':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case 'cancelled':
      return <XCircle className="w-4 h-4 text-gray-600" />;
    case 'refunded':
      return <AlertCircle className="w-4 h-4 text-blue-600" />;
    default:
      return null;
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};
