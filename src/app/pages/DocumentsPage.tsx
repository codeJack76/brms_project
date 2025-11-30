'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, FolderOpen, FileText, HardDrive } from 'lucide-react';
import {
  BarangayFolder,
  BarangayDocument,
  FolderList,
  DocumentList,
  CreateFolderModal,
  RenameFolderModal,
  RenameDocumentModal,
  UploadDocumentModal,
  DeleteConfirmModal,
  DocumentPreviewModal,
  formatFileSize,
} from '../../components/documents';

interface StorageStats {
  totalFolders: number;
  totalDocuments: number;
  totalSize: number;
}

// Demo data for documents
const demoFolders: (BarangayFolder & { document_count?: number })[] = [
  { id: '1', folder_name: 'Ordinances', barangay_id: 'demo', created_by: 'demo', created_at: '2024-01-01T00:00:00Z', document_count: 5 },
  { id: '2', folder_name: 'Financial Reports', barangay_id: 'demo', created_by: 'demo', created_at: '2024-01-01T00:00:00Z', document_count: 8 },
  { id: '3', folder_name: 'Meeting Minutes', barangay_id: 'demo', created_by: 'demo', created_at: '2024-01-01T00:00:00Z', document_count: 12 },
  { id: '4', folder_name: 'Certificates', barangay_id: 'demo', created_by: 'demo', created_at: '2024-01-01T00:00:00Z', document_count: 3 },
];

const demoDocuments: BarangayDocument[] = [
  { id: '1', file_name: 'Barangay Ordinance 2024-001.pdf', file_type: 'application/pdf', file_size: 245000, folder_id: '1', barangay_id: 'demo', file_url: '', uploaded_by: 'demo', uploaded_at: '2024-10-15T08:00:00Z' },
  { id: '2', file_name: 'Annual Budget Report 2024.xlsx', file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', file_size: 128000, folder_id: '2', barangay_id: 'demo', file_url: '', uploaded_by: 'demo', uploaded_at: '2024-11-01T10:30:00Z' },
  { id: '3', file_name: 'Assembly Minutes - Nov 2024.docx', file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', file_size: 85000, folder_id: '3', barangay_id: 'demo', file_url: '', uploaded_by: 'demo', uploaded_at: '2024-11-20T14:00:00Z' },
  { id: '4', file_name: 'Development Plan 2024-2027.pdf', file_type: 'application/pdf', file_size: 1250000, folder_id: '1', barangay_id: 'demo', file_url: '', uploaded_by: 'demo', uploaded_at: '2024-09-01T09:00:00Z' },
];

interface DocumentsPageProps {
  isDemoMode?: boolean;
}

export default function DocumentsPage({ isDemoMode = false }: DocumentsPageProps) {
  // State for folders
  const [folders, setFolders] = useState<(BarangayFolder & { document_count?: number })[]>(isDemoMode ? demoFolders : []);
  const [selectedFolder, setSelectedFolder] = useState<BarangayFolder | null>(null);
  const [isFoldersLoading, setIsFoldersLoading] = useState(!isDemoMode);

  // State for documents
  const [documents, setDocuments] = useState<BarangayDocument[]>([]);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);

  // State for modals
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<BarangayFolder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<BarangayFolder | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<BarangayDocument | null>(null);
  const [documentToPreview, setDocumentToPreview] = useState<BarangayDocument | null>(null);
  const [documentToRename, setDocumentToRename] = useState<BarangayDocument | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<StorageStats>({
    totalFolders: 0,
    totalDocuments: 0,
    totalSize: 0,
  });

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    if (isDemoMode) {
      setStats({
        totalFolders: demoFolders.length,
        totalDocuments: demoFolders.reduce((sum, f) => sum + (f.document_count || 0), 0),
        totalSize: 1708000,
      });
      setIsFoldersLoading(false);
      return;
    }
    
    try {
      setIsFoldersLoading(true);
      const response = await fetch('/api/documents/folders');
      const data = await response.json();

      if (response.ok) {
        setFolders(data);
        // Calculate stats
        const totalDocs = data.reduce(
          (sum: number, f: BarangayFolder & { document_count?: number }) =>
            sum + (f.document_count || 0),
          0
        );
        setStats((prev) => ({
          ...prev,
          totalFolders: data.length,
          totalDocuments: totalDocs,
        }));
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch folders');
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to fetch folders');
    } finally {
      setIsFoldersLoading(false);
    }
  }, []);

  // Fetch documents for selected folder
  const fetchDocuments = useCallback(async (folderId: string) => {
    try {
      setIsDocumentsLoading(true);
      const response = await fetch(`/api/documents?folder_id=${folderId}`);
      const data = await response.json();

      if (response.ok) {
        setDocuments(data);
        // Calculate total size
        const totalSize = data.reduce(
          (sum: number, d: BarangayDocument) => sum + (d.file_size || 0),
          0
        );
        setStats((prev) => ({ ...prev, totalSize }));
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
    } finally {
      setIsDocumentsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Fetch documents when folder is selected
  useEffect(() => {
    if (selectedFolder) {
      fetchDocuments(selectedFolder.id);
    } else {
      setDocuments([]);
    }
  }, [selectedFolder, fetchDocuments]);

  // Folder handlers
  const handleCreateFolder = async (folderName: string) => {
    const response = await fetch('/api/documents/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_name: folderName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create folder');
    }

    setFolders((prev) => [...prev, data]);
    setStats((prev) => ({ ...prev, totalFolders: prev.totalFolders + 1 }));
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    const response = await fetch(`/api/documents/folders/${folderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_name: newName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to rename folder');
    }

    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, folder_name: newName } : f))
    );
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    const response = await fetch(`/api/documents/folders/${folderToDelete.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete folder');
    }

    setFolders((prev) => prev.filter((f) => f.id !== folderToDelete.id));
    if (selectedFolder?.id === folderToDelete.id) {
      setSelectedFolder(null);
    }
    setFolderToDelete(null);
    setStats((prev) => ({ ...prev, totalFolders: prev.totalFolders - 1 }));
  };

  // Document handlers
  const handleUploadDocuments = async (files: File[]) => {
    if (!selectedFolder) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder_id', selectedFolder.id);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to upload ${file.name}`);
      }

      setDocuments((prev) => [data, ...prev]);
    }

    // Update folder document count
    setFolders((prev) =>
      prev.map((f) =>
        f.id === selectedFolder.id
          ? { ...f, document_count: (f.document_count || 0) + files.length }
          : f
      )
    );
    setStats((prev) => ({
      ...prev,
      totalDocuments: prev.totalDocuments + files.length,
    }));
  };

  const handleDownloadDocument = async (document: BarangayDocument) => {
    try {
      // Log the download
      await fetch(`/api/documents/${document.id}/download`, { method: 'POST' });
      
      // Open file in new tab or trigger download
      const link = window.document.createElement('a');
      link.href = document.file_url;
      link.download = document.file_name;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    const response = await fetch(`/api/documents/${documentToDelete.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete document');
    }

    setDocuments((prev) => prev.filter((d) => d.id !== documentToDelete.id));
    
    // Update folder document count
    if (selectedFolder) {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === selectedFolder.id
            ? { ...f, document_count: Math.max(0, (f.document_count || 0) - 1) }
            : f
        )
      );
    }
    setDocumentToDelete(null);
    setStats((prev) => ({
      ...prev,
      totalDocuments: Math.max(0, prev.totalDocuments - 1),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Document Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Organize and manage your barangay documents
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Total Folders
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalFolders}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Total Documents
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.totalDocuments}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <HardDrive className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Storage Used
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatFileSize(stats.totalSize)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Error</h3>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          {selectedFolder ? (
            <DocumentList
              documents={documents}
              folder={selectedFolder}
              isLoading={isDocumentsLoading}
              onBack={() => setSelectedFolder(null)}
              onUpload={() => setIsUploadModalOpen(true)}
              onPreview={(doc) => setDocumentToPreview(doc)}
              onDownload={handleDownloadDocument}
              onDelete={(doc) => setDocumentToDelete(doc)}
              onRename={(doc) => setDocumentToRename(doc)}
            />
          ) : (
            <FolderList
              folders={folders}
              isLoading={isFoldersLoading}
              onSelectFolder={setSelectedFolder}
              onCreateFolder={() => setIsCreateFolderModalOpen(true)}
              onRenameFolder={(folder) => setFolderToRename(folder)}
              onDeleteFolder={(folder) => setFolderToDelete(folder)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
      />

      <RenameFolderModal
        isOpen={!!folderToRename}
        folder={folderToRename}
        onClose={() => setFolderToRename(null)}
        onSubmit={handleRenameFolder}
      />

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        folder={selectedFolder}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadDocuments}
      />

      <DeleteConfirmModal
        isOpen={!!folderToDelete}
        type="folder"
        item={folderToDelete}
        documentCount={folderToDelete?.document_count}
        onClose={() => setFolderToDelete(null)}
        onConfirm={handleDeleteFolder}
      />

      <DeleteConfirmModal
        isOpen={!!documentToDelete}
        type="document"
        item={documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDeleteDocument}
      />

      <DocumentPreviewModal
        isOpen={!!documentToPreview}
        document={documentToPreview}
        onClose={() => setDocumentToPreview(null)}
        onDownload={handleDownloadDocument}
      />

      <RenameDocumentModal
        isOpen={!!documentToRename}
        document={documentToRename}
        onClose={() => setDocumentToRename(null)}
        onSuccess={() => {
          if (selectedFolder) {
            fetchDocuments(selectedFolder.id);
          }
        }}
      />
    </div>
  );
}
