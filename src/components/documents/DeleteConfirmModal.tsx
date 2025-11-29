'use client';

import { useState } from 'react';
import { X, AlertTriangle, Folder, FileText } from 'lucide-react';
import { BarangayFolder, BarangayDocument } from './types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  type: 'folder' | 'document';
  item: BarangayFolder | BarangayDocument | null;
  documentCount?: number; // For folders
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({
  isOpen,
  type,
  item,
  documentCount = 0,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const itemName = type === 'folder' 
    ? (item as BarangayFolder).folder_name 
    : (item as BarangayDocument).file_name;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError('');

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete ${type}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Delete {type === 'folder' ? 'Folder' : 'Document'}
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                {type === 'folder' ? (
                  <Folder className="w-8 h-8 text-red-600 dark:text-red-400" />
                ) : (
                  <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>

            {/* Message */}
            <div className="text-center">
              <p className="text-gray-900 dark:text-white font-medium mb-2">
                Are you sure you want to delete this {type}?
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  &quot;{itemName}&quot;
                </span>
              </p>
              {type === 'folder' && documentCount > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <span className="font-semibold">Warning:</span> This folder contains{' '}
                    {documentCount} {documentCount === 1 ? 'document' : 'documents'} that
                    will also be permanently deleted.
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                This action cannot be undone.
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            )}

            {/* Footer */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
