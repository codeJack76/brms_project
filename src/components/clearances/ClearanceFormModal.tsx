import { X } from 'lucide-react';
import { useState } from 'react';

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

export default function ClearanceFormModal({
  isOpen,
  mode,
  clearance,
  clearanceTypes,
  onClose,
  onSubmit
}: ClearanceFormModalProps) {
  const [formData, setFormData] = useState<Partial<Clearance>>(clearance || {});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    
    if (!formData.residentName && !formData.residentId) errors.residentName = 'Resident name or ID is required';
    if (!formData.clearanceType) errors.clearanceType = 'Clearance type is required';
    if (!formData.purpose) errors.purpose = 'Purpose is required';
    if (!formData.feeAmount) errors.feeAmount = 'Fee amount is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'New Clearance Request' : 'Edit Clearance'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resident Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resident Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.residentName || ''}
                  onChange={(e) => setFormData({ ...formData, residentName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter resident name"
                />
                {formErrors.residentName && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.residentName}</p>
                )}
              </div>

              {/* Clearance Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clearance Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.clearanceType || ''}
                  onChange={(e) => {
                    const selectedType = clearanceTypes.find(t => t.value === e.target.value);
                    setFormData({ 
                      ...formData, 
                      clearanceType: e.target.value as any,
                      feeAmount: selectedType?.fee || 0
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {clearanceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - ₱{type.fee}
                    </option>
                  ))}
                </select>
                {formErrors.clearanceType && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.clearanceType}</p>
                )}
              </div>

              {/* Purpose */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.purpose || ''}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Employment, Business Permit, Medical Assistance"
                />
                {formErrors.purpose && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.purpose}</p>
                )}
              </div>

              {/* Fee Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fee Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    value={formData.feeAmount || ''}
                    onChange={(e) => setFormData({ ...formData, feeAmount: parseFloat(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {formErrors.feeAmount && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.feeAmount}</p>
                )}
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus || 'Unpaid'}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || 'Pending'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Released">Released</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* OR Number (if paid) */}
              {formData.paymentStatus === 'Paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OR Number
                  </label>
                  <input
                    type="text"
                    value={formData.orNumber || ''}
                    onChange={(e) => setFormData({ ...formData, orNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Official Receipt Number"
                  />
                </div>
              )}

              {/* Pending Case */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasPendingCase || false}
                    onChange={(e) => setFormData({ ...formData, hasPendingCase: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Has pending case or derogatory record
                  </span>
                </label>
              </div>

              {/* Case Details (if has pending case) */}
              {formData.hasPendingCase && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Case Details
                  </label>
                  <textarea
                    value={formData.caseDetails || ''}
                    onChange={(e) => setFormData({ ...formData, caseDetails: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the case details..."
                  />
                </div>
              )}

              {/* Remarks */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks || ''}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or remarks..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Request' : 'Update Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
