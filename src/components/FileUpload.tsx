// File Upload Component
// Reusable component for uploading files with drag-and-drop support

'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, FileIcon, Check, AlertCircle } from 'lucide-react';
import { useFileUpload, validateFile, formatFileSize, getFileIcon, FileUploadOptions } from '@/lib/files/utils';

interface FileUploadProps {
  bucket?: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  ownerId?: string;
  isPublic?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  accept?: string;
  multiple?: boolean;
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({
  bucket = 'documents',
  category = 'general',
  entityType,
  entityId,
  ownerId,
  isPublic = false,
  maxSize = 50 * 1024 * 1024,
  allowedTypes = [],
  accept,
  multiple = false,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const { uploadFile, uploading, progress, error } = useFileUpload();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const filesToAdd = multiple ? files : [files[0]];
    
    // Validate files
    const validFiles = filesToAdd.filter(file => {
      const validation = validateFile(file, { maxSize, allowedTypes });
      if (!validation.valid) {
        onUploadError?.(validation.error || 'Invalid file');
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    const uploaded: any[] = [];
    
    for (const file of selectedFiles) {
      try {
        const options: FileUploadOptions = {
          bucket,
          category,
          entityType,
          entityId,
          ownerId,
          isPublic,
        };

        const result = await uploadFile(file, options);
        if (result) {
          uploaded.push(result);
        }
      } catch (err: any) {
        onUploadError?.(err.message);
      }
    }

    if (uploaded.length > 0) {
      setUploadedFiles(uploaded);
      onUploadComplete?.(uploaded);
      setSelectedFiles([]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Maximum size: {formatFileSize(maxSize)}
          {allowedTypes.length > 0 && ` • Allowed types: ${allowedTypes.join(', ')}`}
        </p>
        <button
          type="button"
          onClick={onButtonClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Select Files
        </button>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFileIcon(file.type)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
          
          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? `Uploading... ${progress}%` : 'Upload Files'}
          </button>
        </div>
      )}

      {/* Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
            {progress}% uploaded
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success */}
      {uploadedFiles.length > 0 && !uploading && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-2">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-600 dark:text-green-400">
            {uploadedFiles.length} file(s) uploaded successfully!
          </p>
        </div>
      )}
    </div>
  );
}
