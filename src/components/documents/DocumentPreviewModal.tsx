'use client';

import { X, Download, ExternalLink } from 'lucide-react';
import { BarangayDocument, formatFileSize, isPreviewable } from './types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  document: BarangayDocument | null;
  onClose: () => void;
  onDownload: (document: BarangayDocument) => void;
}

export default function DocumentPreviewModal({
  isOpen,
  document,
  onClose,
  onDownload,
}: DocumentPreviewModalProps) {
  if (!isOpen || !document) return null;

  const isImage = document.file_type?.startsWith('image/');
  const isPdf = document.file_type === 'application/pdf';
  const isText = document.file_type?.startsWith('text/');
  const canPreview = isPreviewable(document.file_type);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-12 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                {document.file_name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(document.file_size)} • {document.file_type || 'Unknown type'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={() => onDownload(document)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950">
          {canPreview ? (
            <>
              {isImage && (
                <div className="flex items-center justify-center min-h-full p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={document.file_url}
                    alt={document.file_name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}
              {isPdf && (
                <iframe
                  src={`${document.file_url}#toolbar=1`}
                  className="w-full h-full"
                  title={document.file_name}
                />
              )}
              {isText && (
                <iframe
                  src={document.file_url}
                  className="w-full h-full bg-white dark:bg-gray-900"
                  title={document.file_name}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Preview not available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                This file type cannot be previewed in the browser. Please download the file to view it.
              </p>
              <button
                onClick={() => onDownload(document)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
