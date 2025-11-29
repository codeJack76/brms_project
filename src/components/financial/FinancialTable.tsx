'use client';

import { Eye, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { Transaction, SortField, SortDirection } from './types';
import { getTypeColor, getStatusColor, getStatusIcon, formatCurrency } from './utils';

interface FinancialTableProps {
  transactions: Transaction[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onView: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export default function FinancialTable({
  transactions,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}: FinancialTableProps) {
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-4 h-4 ${sortField === field ? 'text-blue-600' : 'text-gray-400'}`} />
        {sortField === field && (
          <span className="text-xs text-blue-600">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <SortableHeader field="transactionNumber">Transaction ID</SortableHeader>
            <SortableHeader field="type">Type</SortableHeader>
            <SortableHeader field="category">Category</SortableHeader>
            <SortableHeader field="amount">Amount</SortableHeader>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Paid By
            </th>
            <SortableHeader field="transactionDate">Date</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {txn.transactionNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(txn.type)}`}>
                    {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {txn.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(txn.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {txn.paidBy || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {new Date(txn.transactionDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(txn.status)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(txn.status)}`}>
                      {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(txn)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(txn)}
                      className="p-1 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(txn)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
