'use client';

import { X, FileText, User, DollarSign, ClipboardList, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Clearance {
  id?: string;
  residentName?: string;
  residentId?: string;
  clearanceType?: string;
  purpose?: string;
  feeAmount?: number;
  paymentStatus?: string;
  status?: string;
  orNumber?: string;
  hasPendingCase?: boolean;
  caseDetails?: string;
  remarks?: string;
  clearanceStatus?: string;
}

interface ClearanceType {
  value: string;
  label: string;
  fee: number;
}

interface ClearanceFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  clearance: Partial<Clearance> | null;
  clearanceTypes: ClearanceType[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const initialFormData: Partial<Clearance> = {
  residentName: '',
  residentId: '',
  clearanceType: '',
  purpose: '',
  feeAmount: 0,
  paymentStatus: 'Unpaid',
  status: 'Pending',
  orNumber: '',
  hasPendingCase: false,
  caseDetails: '',
  remarks: '',
  clearanceStatus: 'Pending',
};

export default function ClearanceFormModal({
  isOpen,
  mode,
  clearance,
  clearanceTypes,
  onClose,
  onSubmit
}: ClearanceFormModalProps) {
  const [formData, setFormData] = useState<Partial<Clearance>>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (clearance) {
        setFormData({ ...initialFormData, ...clearance });
      } else {
        setFormData(initialFormData);
      }
      setFormErrors({});
    }
  }, [isOpen, clearance]);

  if (!isOpen) return null;

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.residentName?.trim() && !formData.residentId) {
      errors.residentName = 'Resident name is required';
    }
    if (!formData.clearanceType) {
      errors.clearanceType = 'Clearance type is required';
    }
    if (!formData.purpose?.trim()) {
      errors.purpose = 'Purpose is required';
    }
    if (formData.feeAmount === undefined || formData.feeAmount === null) {
      errors.feeAmount = 'Fee amount is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSaving(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearanceTypeChange = (value: string) => {
    const selectedType = clearanceTypes.find(t => t.value === value);
    setFormData({ 
      ...formData, 
      clearanceType: value,
      feeAmount: selectedType?.fee || formData.feeAmount
    });
    if (formErrors.clearanceType) {
      setFormErrors({ ...formErrors, clearanceType: '' });
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
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mode === 'create' ? 'New Clearance Request' : 'Edit Clearance'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {mode === 'create' ? 'Create a new barangay clearance request' : 'Update clearance information'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
              disabled={isSaving}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-8">
            {/* Resident Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resident Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Resident Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.residentName || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, residentName: e.target.value });
                      if (formErrors.residentName) setFormErrors({ ...formErrors, residentName: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.residentName ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter resident name"
                    disabled={isSaving}
                  />
                  {formErrors.residentName && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.residentName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Clearance Type <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={formData.clearanceType || ''}
                    onChange={(e) => handleClearanceTypeChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.clearanceType ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isSaving}
                  >
                    <option value="">Select clearance type</option>
                    {clearanceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - ₱{type.fee}
                      </option>
                    ))}
                  </select>
                  {formErrors.clearanceType && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.clearanceType}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Request Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Purpose <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.purpose || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, purpose: e.target.value });
                      if (formErrors.purpose) setFormErrors({ ...formErrors, purpose: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.purpose ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Employment, Business Permit, Medical Assistance"
                    disabled={isSaving}
                  />
                  {formErrors.purpose && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.purpose}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={formData.status || 'Pending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isSaving}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Released">Released</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex items-center space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 pt-6">
                    <input
                      type="checkbox"
                      checked={formData.hasPendingCase || false}
                      onChange={(e) => setFormData({ ...formData, hasPendingCase: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isSaving}
                    />
                    <span>Has pending case or derogatory record</span>
                  </label>
                </div>

                {formData.hasPendingCase && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Case Details
                    </label>
                    <textarea
                      value={formData.caseDetails || ''}
                      onChange={(e) => setFormData({ ...formData, caseDetails: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Describe the case details..."
                      disabled={isSaving}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fee Amount <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">₱</span>
                    <input
                      type="number"
                      value={formData.feeAmount ?? ''}
                      onChange={(e) => {
                        setFormData({ ...formData, feeAmount: parseFloat(e.target.value) || 0 });
                        if (formErrors.feeAmount) setFormErrors({ ...formErrors, feeAmount: '' });
                      }}
                      className={`w-full pl-9 pr-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        formErrors.feeAmount ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={isSaving}
                    />
                  </div>
                  {formErrors.feeAmount && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.feeAmount}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus || 'Unpaid'}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isSaving}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                {formData.paymentStatus === 'Paid' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      OR Number
                    </label>
                    <input
                      type="text"
                      value={formData.orNumber || ''}
                      onChange={(e) => setFormData({ ...formData, orNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Official Receipt Number"
                      disabled={isSaving}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Remarks Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks || ''}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Additional notes or remarks..."
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </form>

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
              type="submit"
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>{mode === 'create' ? 'Create Request' : 'Update Request'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
