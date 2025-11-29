'use client';

import { useState, useEffect } from 'react';
import { X, Pencil } from 'lucide-react';
import { BarangayFolder } from './types';

interface RenameFolderModalProps {
  isOpen: boolean;
  folder: BarangayFolder | null;
  onClose: () => void;
  onSubmit: (folderId: string, newName: string) => Promise<void>;
}

export default function RenameFolderModal({
  isOpen,
  folder,
  onClose,
  onSubmit,
}: RenameFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (folder) {
      setFolderName(folder.folder_name);
    }
  }, [folder]);

  if (!isOpen || !folder) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }

    if (folderName.trim() === folder.folder_name) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(folder.id, folderName.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Rename Folder</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => {
                    setFolderName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter folder name"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
