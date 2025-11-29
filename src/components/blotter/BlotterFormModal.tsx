import { X, FileText, Users, Calendar, MapPin, AlertTriangle, Clock } from 'lucide-react';
import { BlotterFormData, INCIDENT_TYPES, ASSIGNEES } from './types';

interface BlotterFormModalProps {
  mode: 'create' | 'edit';
  formData: BlotterFormData;
  formErrors: Record<string, string>;
  saving: boolean;
  onFormChange: (data: BlotterFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function BlotterFormModal({
  mode,
  formData,
  formErrors,
  saving,
  onFormChange,
  onSubmit,
  onClose,
}: BlotterFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mode === 'create' ? 'New Blotter Record' : 'Edit Blotter Record'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {mode === 'create' ? 'File a new blotter case' : 'Update blotter record information'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              type="button" 
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all" 
              disabled={saving}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-8">
            {/* Parties Involved Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parties Involved</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Complainant <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.complainant}
                    onChange={(e) => onFormChange({ ...formData, complainant: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.complainant ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter complainant name"
                    disabled={saving}
                  />
                  {formErrors.complainant && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{formErrors.complainant}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Respondent <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.respondent}
                    onChange={(e) => onFormChange({ ...formData, respondent: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.respondent ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter respondent name"
                    disabled={saving}
                  />
                  {formErrors.respondent && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{formErrors.respondent}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Incident Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Incident Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Incident Type <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={formData.incidentType}
                    onChange={(e) => onFormChange({ ...formData, incidentType: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.incidentType ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={saving}
                  >
                    <option value="">Select incident type</option>
                    {INCIDENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {formErrors.incidentType && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{formErrors.incidentType}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Incident Date <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => onFormChange({ ...formData, incidentDate: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl transition-all focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      formErrors.incidentDate ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={saving}
                  />
                  {formErrors.incidentDate && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{formErrors.incidentDate}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => onFormChange({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter incident location"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Filing Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filing Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Filed Date
                  </label>
                  <input
                    type="date"
                    value={formData.filedDate}
                    onChange={(e) => onFormChange({ ...formData, filedDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assigned To</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => onFormChange({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    disabled={saving}
                  >
                    <option value="">Select assignee</option>
                    {ASSIGNEES.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => onFormChange({ ...formData, status: e.target.value as BlotterFormData['status'] })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    disabled={saving}
                  >
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => onFormChange({ ...formData, remarks: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter any additional remarks or notes about the case..."
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Form Footer */}
        <div className="px-8 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={onSubmit}
              className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg shadow-orange-500/30"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>{mode === 'create' ? 'Create Record' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
