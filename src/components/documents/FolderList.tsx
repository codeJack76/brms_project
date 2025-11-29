'use client';

import { BarangayFolder } from './types';
import FolderCard from './FolderCard';
import { FolderPlus, Search } from 'lucide-react';
import { useState } from 'react';

interface FolderListProps {
  folders: (BarangayFolder & { document_count?: number })[];
  isLoading: boolean;
  onSelectFolder: (folder: BarangayFolder) => void;
  onCreateFolder: () => void;
  onRenameFolder: (folder: BarangayFolder) => void;
  onDeleteFolder: (folder: BarangayFolder) => void;
}

export default function FolderList({
  folders,
  isLoading,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFolders = folders.filter((folder) =>
    folder.folder_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-32"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <button
          onClick={onCreateFolder}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
        >
          <FolderPlus className="w-5 h-5" />
          <span>Create Folder</span>
        </button>
      </div>

      {/* Folders Grid */}
      {filteredFolders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <FolderPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {searchQuery ? 'No folders found' : 'No folders yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-sm">
            {searchQuery
              ? `No folders match "${searchQuery}"`
              : 'Create your first folder to start organizing documents'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateFolder}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Folder
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onSelect={onSelectFolder}
              onRename={onRenameFolder}
              onDelete={onDeleteFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
