'use client';

import { Trash2, X, AlertCircle } from 'lucide-react';
import { Transaction } from './types';

interface FinancialDeleteModalProps {
  transaction: Transaction;
  onConfirm: () => void;
  onClose: () => void;
  isSaving: boolean;
}

export default function FinancialDeleteModal({
  transaction,
  onConfirm,
  onClose,
  isSaving,
}: FinancialDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Delete Transaction
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Are you sure you want to delete transaction <strong className="text-gray-900 dark:text-white">{transaction.transactionNumber}</strong>? This action cannot be undone.
          </p>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
