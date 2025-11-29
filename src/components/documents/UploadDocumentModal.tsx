'use client';

import { useState, useRef } from 'react';
import { X, Upload, File, X as XIcon } from 'lucide-react';
import { BarangayFolder, formatFileSize } from './types';

interface UploadDocumentModalProps {
  isOpen: boolean;
  folder: BarangayFolder | null;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

export default function UploadDocumentModal({
  isOpen,
  folder,
  onClose,
  onUpload,
}: UploadDocumentModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !folder) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    setError('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await onUpload(selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadProgress(0);
        onClose();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFiles([]);
    setError('');
    setUploadProgress(0);
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
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Upload Documents</h2>
                  <p className="text-sm text-white/80">to {folder.folder_name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-1">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Support for images, PDFs, documents, and more
              </p>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected files ({selectedFiles.length})
                </p>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      disabled={isUploading}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {/* Footer */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading || selectedFiles.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
