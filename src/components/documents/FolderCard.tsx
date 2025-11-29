'use client';

import { BarangayFolder } from './types';
import { Folder, FileText, Pencil, Trash2 } from 'lucide-react';

interface FolderCardProps {
  folder: BarangayFolder & { document_count?: number };
  onSelect: (folder: BarangayFolder) => void;
  onRename: (folder: BarangayFolder) => void;
  onDelete: (folder: BarangayFolder) => void;
}

export default function FolderCard({
  folder,
  onSelect,
  onRename,
  onDelete,
}: FolderCardProps) {
  const documentCount = folder.document_count ?? 0;

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(folder)}
    >
      {/* Folder Icon */}
      <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl mb-3">
        <Folder className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>

      {/* Folder Name */}
      <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1" title={folder.folder_name}>
        {folder.folder_name}
      </h3>

      {/* Document Count */}
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <FileText className="w-4 h-4 mr-1" />
        <span>
          {documentCount} {documentCount === 1 ? 'document' : 'documents'}
        </span>
      </div>

      {/* Action Buttons - Show on hover */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRename(folder);
          }}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Rename folder"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(folder);
          }}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Delete folder"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Created Date */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Created {new Date(folder.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
