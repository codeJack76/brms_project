// Document Management Types for Barangay Management System

export interface BarangayFolder {
  id: string;
  barangay_id: string;
  folder_name: string;
  created_by: string;
  created_at: string;
  // Virtual field for UI
  document_count?: number;
}

export interface BarangayDocument {
  id: string;
  barangay_id: string;
  folder_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string;
  uploaded_at: string;
  // Virtual fields for UI
  folder_name?: string;
  uploader_name?: string;
}

export interface BarangayActivityLog {
  id: string;
  barangay_id: string;
  action: ActivityAction;
  user_id: string;
  document_id: string | null;
  folder_id: string | null;
  timestamp: string;
  details: Record<string, unknown> | null;
  // Virtual fields for UI
  user_name?: string;
  document_name?: string;
  folder_name?: string;
}

export type ActivityAction =
  | 'folder_created'
  | 'folder_renamed'
  | 'folder_deleted'
  | 'document_uploaded'
  | 'document_downloaded'
  | 'document_deleted'
  | 'document_viewed';

// Form Data Types
export interface CreateFolderFormData {
  folder_name: string;
}

export interface RenameFolderFormData {
  folder_name: string;
}

export interface UploadDocumentFormData {
  folder_id: string;
  files: FileList | File[];
}

// API Response Types
export interface FolderWithDocumentCount extends BarangayFolder {
  document_count: number;
}

export interface DocumentWithMeta extends BarangayDocument {
  folder: Pick<BarangayFolder, 'id' | 'folder_name'>;
}

// Filter and Sort Options
export interface DocumentFilters {
  folder_id?: string;
  file_type?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface DocumentSort {
  field: 'file_name' | 'uploaded_at' | 'file_size' | 'file_type';
  direction: 'asc' | 'desc';
}

// UI State Types
export interface DocumentsPageState {
  selectedFolder: BarangayFolder | null;
  viewMode: 'grid' | 'list';
  isCreateFolderModalOpen: boolean;
  isRenameFolderModalOpen: boolean;
  isUploadModalOpen: boolean;
  isDeleteFolderModalOpen: boolean;
  isDeleteDocumentModalOpen: boolean;
  isPreviewModalOpen: boolean;
  selectedDocument: BarangayDocument | null;
  folderToRename: BarangayFolder | null;
  folderToDelete: BarangayFolder | null;
  documentToDelete: BarangayDocument | null;
}

// File Type Categories for filtering
export const FILE_TYPE_CATEGORIES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  spreadsheet: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  presentation: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  text: ['text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript'],
} as const;

// Helper to get file category
export function getFileCategory(mimeType: string): string {
  for (const [category, types] of Object.entries(FILE_TYPE_CATEGORIES)) {
    if (types.includes(mimeType as never)) {
      return category;
    }
  }
  return 'other';
}

// Helper to format file size
export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper to get file extension
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

// Helper to check if file is previewable
export function isPreviewable(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/')
  );
}
