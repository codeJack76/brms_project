'use client';

import { X, DollarSign, FileText, User, Calendar, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { FormData, Transaction } from './types';
import { getCategories } from './utils';

interface FinancialFormModalProps {
  mode: 'create' | 'edit';
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSaving: boolean;
}

export default function FinancialFormModal({
  mode,
  formData,
  onFormChange,
  onSubmit,
  onClose,
  isSaving,
}: FinancialFormModalProps) {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.type) errors.type = 'Type is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Valid amount is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mode === 'create' ? 'New Transaction' : 'Edit Transaction'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {mode === 'create' ? 'Record a new financial transaction' : 'Update transaction information'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
              disabled={isSaving}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-8">
            {/* Transaction Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      onFormChange({ ...formData, type: e.target.value as 'income' | 'expense', category: '' });
                      if (formErrors.type) setFormErrors({ ...formErrors, type: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.type ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isSaving}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  {formErrors.type && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.type}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      onFormChange({ ...formData, category: e.target.value });
                      if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.category ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isSaving}
                  >
                    <option value="">Select Category</option>
                    {getCategories(formData.type).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.category}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">₱</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => {
                        onFormChange({ ...formData, amount: parseFloat(e.target.value) || 0 });
                        if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' });
                      }}
                      className={`w-full pl-9 pr-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        formErrors.amount ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="0.00"
                      disabled={isSaving}
                    />
                  </div>
                  {formErrors.amount && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.amount}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => onFormChange({ ...formData, transaction_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => onFormChange({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isSaving}
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={formData.reference_number}
                    onChange={(e) => onFormChange({ ...formData, reference_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Optional reference"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* People Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">People Involved</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Paid By
                  </label>
                  <input
                    type="text"
                    value={formData.paid_by}
                    onChange={(e) => onFormChange({ ...formData, paid_by: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter name"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Received By
                  </label>
                  <input
                    type="text"
                    value={formData.received_by}
                    onChange={(e) => onFormChange({ ...formData, received_by: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Staff name"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Transaction description"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Additional notes"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  <span>{mode === 'create' ? 'Create Transaction' : 'Update Transaction'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
