// File List Component
// Display and manage uploaded files

'use client';

import { useEffect, useState } from 'react';
import { Download, Trash2, Eye, FileIcon } from 'lucide-react';
import { useFiles, getFileUrl, deleteFile, formatFileSize, getFileIcon, downloadFile } from '@/lib/files/utils';

interface FileListProps {
  entityType?: string;
  entityId?: string;
  category?: string;
  bucket?: string;
  ownerId?: string;
  onFileDelete?: (fileId: string) => void;
  allowDelete?: boolean;
}

export default function FileList({
  entityType,
  entityId,
  category,
  bucket,
  ownerId,
  onFileDelete,
  allowDelete = true,
}: FileListProps) {
  const { files, loading, error, refetch } = useFiles({
    entityType,
    entityId,
    category,
    bucket,
    ownerId,
  });

  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    refetch();
  }, [entityType, entityId, category, bucket, ownerId]);

  const handlePreview = async (file: any) => {
    const url = await getFileUrl(file.id);
    if (url) {
      setPreviewFile(file);
      setPreviewUrl(url);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      await downloadFile(file.id, file.original_filename);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const success = await deleteFile(fileId);
      if (success) {
        onFileDelete?.(fileId);
        refetch();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FileIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{getFileIcon(file.content_type)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {file.original_filename}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatFileSize(file.file_size)}</span>
                <span>•</span>
                <span>{new Date(file.created_at).toLocaleDateString()}</span>
                {file.description && (
                  <>
                    <span>•</span>
                    <span className="truncate">{file.description}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {/* Preview Button (for images) */}
            {file.content_type.startsWith('image/') && (
              <button
                onClick={() => handlePreview(file)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            {/* Download Button */}
            <button
              onClick={() => handleDownload(file)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            {allowDelete && (
              <button
                onClick={() => handleDelete(file.id)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Preview Modal */}
      {previewFile && previewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setPreviewFile(null);
            setPreviewUrl(null);
          }}
        >
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setPreviewFile(null);
                setPreviewUrl(null);
              }}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ×
            </button>
            <img
              src={previewUrl}
              alt={previewFile.original_filename}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <p className="text-white text-center mt-2">{previewFile.original_filename}</p>
          </div>
        </div>
      )}
    </div>
  );
}
