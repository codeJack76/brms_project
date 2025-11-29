'use client';

import { X, DollarSign, Eye, Edit, FileText, User, Calendar } from 'lucide-react';
import { Transaction } from './types';
import { getTypeColor, getStatusColor, formatCurrency } from './utils';

interface FinancialViewModalProps {
  transaction: Transaction;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
}

export default function FinancialViewModal({
  transaction,
  onClose,
  onEdit,
}: FinancialViewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  View complete transaction information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-8">
            {/* Transaction Summary */}
            <div className="flex flex-col items-center py-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {transaction.transactionNumber}
              </span>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {formatCurrency(transaction.amount)}
              </div>
              <div className="flex gap-2">
                <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
                <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Transaction Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                  <p className="text-gray-900 dark:text-white font-medium">{transaction.category}</p>
                </div>
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{new Date(transaction.transactionDate).toLocaleDateString()}</p>
                </div>
                {transaction.referenceNumber && (
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Reference Number</label>
                    <p className="text-gray-900 dark:text-white font-medium">{transaction.referenceNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* People Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">People Involved</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Paid By</label>
                  <p className="text-gray-900 dark:text-white font-medium">{transaction.paidBy || '-'}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Received By</label>
                  <p className="text-gray-900 dark:text-white font-medium">{transaction.receivedBy || '-'}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(transaction.description || transaction.notes) && (
              <div className="space-y-4">
                {transaction.description && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                    <p className="text-gray-900 dark:text-white">{transaction.description}</p>
                  </div>
                )}
                {transaction.notes && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                    <p className="text-gray-900 dark:text-white">{transaction.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Transaction</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
