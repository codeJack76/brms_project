import { AlertTriangle, X } from 'lucide-react';
import { Resident } from './types';
import { getFullName } from './utils';

interface DeleteConfirmModalProps {
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  resident,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen || !resident) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Resident</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200"
            disabled={isDeleting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{getFullName(resident)}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Resident</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
