import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  residentName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  residentName,
  loading,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Clearance</h2>
          </div>
          <button 
            onClick={onCancel} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete the clearance request for <strong className="text-gray-900 dark:text-white">{residentName}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50 font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Clearance</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
