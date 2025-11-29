import { X, FileText, Users, Calendar, MapPin, AlertTriangle, Clock, Filter, Edit } from 'lucide-react';
import { BlotterRecord } from './types';
import { getStatusColor, getStatusIcon } from './utils';

interface BlotterViewModalProps {
  record: BlotterRecord;
  onClose: () => void;
  onEdit: (record: BlotterRecord) => void;
  onUpdateStatus: (record: BlotterRecord, newStatus: string) => void;
}

export default function BlotterViewModal({
  record,
  onClose,
  onEdit,
  onUpdateStatus,
}: BlotterViewModalProps) {
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Case Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  View case information and update status
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              type="button" 
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-6">
            {/* Case Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Case Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Case Number</label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-900 dark:text-white font-medium">{record.caseNumber}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parties Involved Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parties Involved</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complainant</label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-900 dark:text-white">{record.complainant}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Respondent</label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-900 dark:text-white">{record.respondent}</p>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Incident Type</label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-900 dark:text-white">{record.incidentType}</p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Incident Date
                  </label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-900 dark:text-white">{record.incidentDate}</p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-900 dark:text-white">{record.location || '-'}</p>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filed Date</label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-900 dark:text-white">{record.filedDate}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assigned To</label>
                  <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-900 dark:text-white">{record.assignedTo || '-'}</p>
                </div>
                {record.remarks && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remarks</label>
                    <p className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-900 dark:text-white">{record.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Status Update */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Filter className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Status Update</h3>
              </div>
              <div className="flex gap-3 flex-wrap">
                {['pending', 'investigating', 'resolved', 'dismissed'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      onUpdateStatus(record, status);
                      onClose();
                    }}
                    disabled={record.status === status}
                    className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                      record.status === status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                        : `${getStatusColor(status)} hover:opacity-80 shadow-sm`
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* View Footer */}
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
              onClick={() => onEdit(record)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
