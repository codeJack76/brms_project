'use client';

import { BarangayDocument, BarangayFolder } from './types';
import { formatFileSize, getFileCategory, isPreviewable } from './types';
import {
  FileText,
  Image,
  FileSpreadsheet,
  FileArchive,
  File,
  Download,
  Trash2,
  Eye,
  ArrowLeft,
  Upload,
  Search,
  Grid3X3,
  List,
  Pencil,
} from 'lucide-react';
import { useState } from 'react';

interface DocumentListProps {
  documents: BarangayDocument[];
  folder: BarangayFolder;
  isLoading: boolean;
  onBack: () => void;
  onUpload: () => void;
  onPreview: (document: BarangayDocument) => void;
  onDownload: (document: BarangayDocument) => void;
  onDelete: (document: BarangayDocument) => void;
  onRename: (document: BarangayDocument) => void;
}

// Get icon based on file type
function getFileIcon(fileType: string | null) {
  const category = fileType ? getFileCategory(fileType) : 'other';
  
  switch (category) {
    case 'image':
      return <Image className="w-6 h-6" />;
    case 'document':
      return <FileText className="w-6 h-6" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="w-6 h-6" />;
    case 'archive':
      return <FileArchive className="w-6 h-6" />;
    default:
      return <File className="w-6 h-6" />;
  }
}

// Get icon color based on file type
function getIconColor(fileType: string | null) {
  const category = fileType ? getFileCategory(fileType) : 'other';
  
  switch (category) {
    case 'image':
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    case 'document':
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
    case 'spreadsheet':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
    case 'archive':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
  }
}

export default function DocumentList({
  documents,
  folder,
  isLoading,
  onBack,
  onUpload,
  onPreview,
  onDownload,
  onDelete,
  onRename,
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredDocuments = documents.filter((doc) =>
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {folder.folder_name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </p>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              } transition-colors`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              } transition-colors`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
          >
            <Upload className="w-5 h-5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Documents */}
      {filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-sm">
            {searchQuery
              ? `No documents match "${searchQuery}"`
              : 'Upload your first document to this folder'}
          </p>
          {!searchQuery && (
            <button
              onClick={onUpload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Upload Document
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Size
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Uploaded
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${getIconColor(doc.file_type)}`}
                      >
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {doc.file_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                          {formatFileSize(doc.file_size)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                    {formatFileSize(doc.file_size)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {isPreviewable(doc.file_type) && (
                        <button
                          onClick={() => onPreview(doc)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onRename(doc)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                        title="Rename"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDownload(doc)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(doc)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
            >
              <div
                className={`w-12 h-12 rounded-xl ${getIconColor(doc.file_type)} flex items-center justify-center mb-3`}
              >
                {getFileIcon(doc.file_type)}
              </div>
              <h4
                className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1"
                title={doc.file_name}
              >
                {doc.file_name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(doc.file_size)}
              </p>

              {/* Action Buttons - Show on hover */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {isPreviewable(doc.file_type) && (
                  <button
                    onClick={() => onPreview(doc)}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onRename(doc)}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                  title="Rename"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDownload(doc)}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(doc)}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
