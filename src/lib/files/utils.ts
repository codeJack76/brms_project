// File Management Utilities
// React hooks and helper functions for file uploads, downloads, and management

import { useState, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export interface FileUploadOptions {
  bucket?: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  ownerId?: string;
  isPublic?: boolean;
  description?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadedFile {
  id: string;
  filename: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  file_category: string;
  url: string | null;
  description?: string | null;
  created_at: string;
}

// Hook for uploading files
export function useFileUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File, options: FileUploadOptions = {}): Promise<UploadedFile | null> => {
      if (!user?.id) {
        setError('User not authenticated');
        return null;
      }

      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);
        formData.append('bucket', options.bucket || 'documents');
        formData.append('category', options.category || 'general');
        
        if (options.entityType) formData.append('entityType', options.entityType);
        if (options.entityId) formData.append('entityId', options.entityId);
        if (options.ownerId) formData.append('ownerId', options.ownerId);
        if (options.isPublic !== undefined) formData.append('isPublic', String(options.isPublic));
        if (options.description) formData.append('description', options.description);

        // Use XMLHttpRequest to track progress
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentage = Math.round((e.loaded / e.total) * 100);
              setProgress(percentage);
              options.onProgress?.(percentage);
            }
          });

          xhr.addEventListener('load', () => {
            setUploading(false);
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              resolve(response.file);
            } else {
              const error = JSON.parse(xhr.responseText);
              setError(error.error || 'Upload failed');
              reject(new Error(error.error || 'Upload failed'));
            }
          });

          xhr.addEventListener('error', () => {
            setUploading(false);
            setError('Network error');
            reject(new Error('Network error'));
          });

          xhr.open('POST', '/api/files/upload');
          xhr.send(formData);
        });
      } catch (err: any) {
        setUploading(false);
        setError(err.message);
        return null;
      }
    },
    [user]
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return { uploadFile, uploading, progress, error, reset };
}

// Hook for fetching files
export function useFiles(filters: {
  entityType?: string;
  entityId?: string;
  category?: string;
  bucket?: string;
  ownerId?: string;
} = {}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.entityId) params.append('entityId', filters.entityId);
      if (filters.category) params.append('category', filters.category);
      if (filters.bucket) params.append('bucket', filters.bucket);
      if (filters.ownerId) params.append('ownerId', filters.ownerId);

      const response = await fetch(`/api/files?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch files');
      }

      setFiles(data.files);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.entityType, filters.entityId, filters.category, filters.bucket, filters.ownerId]);

  return { files, loading, error, refetch: fetchFiles };
}

// Utility to get file download URL
export async function getFileUrl(fileId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/files/${fileId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get file URL');
    }

    return data.url;
  } catch (error) {
    console.error('Get file URL error:', error);
    return null;
  }
}

// Utility to delete a file
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete file');
    }

    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
}

// Utility to update file metadata
export async function updateFileMetadata(
  fileId: string,
  updates: {
    description?: string;
    tags?: string[];
    is_public?: boolean;
    file_category?: string;
  }
): Promise<boolean> {
  try {
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update file');
    }

    return true;
  } catch (error) {
    console.error('Update file error:', error);
    return false;
  }
}

// Utility to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Utility to get file icon based on content type
export function getFileIcon(contentType: string): string {
  if (contentType.startsWith('image/')) return '🖼️';
  if (contentType.startsWith('video/')) return '🎥';
  if (contentType.startsWith('audio/')) return '🎵';
  if (contentType.includes('pdf')) return '📄';
  if (contentType.includes('word') || contentType.includes('document')) return '📝';
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
  if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📽️';
  if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('compressed')) return '📦';
  return '📎';
}

// Utility to validate file before upload
export function validateFile(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || 50 * 1024 * 1024; // 50 MB default
  const allowedTypes = options.allowedTypes || [];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${formatFileSize(maxSize)}`,
    };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

// Utility to download file
export async function downloadFile(fileId: string, filename?: string) {
  try {
    const url = await getFileUrl(fileId);
    if (!url) {
      throw new Error('Failed to get download URL');
    }

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download file error:', error);
    throw error;
  }
}
