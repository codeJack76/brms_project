'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { BarangayDocument } from './types';

interface RenameDocumentModalProps {
  document: BarangayDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenameDocumentModal({
  document,
  isOpen,
  onClose,
  onSuccess,
}: RenameDocumentModalProps) {
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get file extension
  const getFileExtension = (fileName: string) => {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot) : '';
  };

  // Get file name without extension
  const getFileNameWithoutExtension = (fileName: string) => {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
  };

  useEffect(() => {
    if (document) {
      setNewName(getFileNameWithoutExtension(document.file_name));
      setError(null);
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const fileExtension = getFileExtension(document.file_name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setError('Please enter a file name');
      return;
    }

    // Check if name actually changed
    if (trimmedName === getFileNameWithoutExtension(document.file_name)) {
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const fullNewName = trimmedName + fileExtension;

      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_name: fullNewName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename document');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Rename Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              File Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter file name"
                autoFocus
              />
              <span className="px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 text-sm">
                {fileExtension}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              The file extension cannot be changed
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !newName.trim()}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                'Rename'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
