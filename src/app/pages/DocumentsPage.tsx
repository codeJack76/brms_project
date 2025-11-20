'use client';

import { useState } from 'react';
import { FileText, Search, Filter, Plus, Eye, Download, Trash2, Upload, Folder, File } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  tags: string[];
}

interface Statistics {
  label: string;
  value: string;
  change: string;
  color: string;
}

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const statistics: Statistics[] = [
    { label: 'Total Documents', value: '1,245', change: '+18%', color: 'blue' },
    { label: 'This Month', value: '89', change: '+12%', color: 'green' },
    { label: 'Storage Used', value: '45.2 GB', change: '+8%', color: 'yellow' },
    { label: 'Categories', value: '12', change: '+2', color: 'purple' },
  ];

  const documents: Document[] = [
    {
      id: 1,
      name: 'Barangay Resolution 2024-01',
      type: 'PDF',
      category: 'Resolutions',
      size: '2.4 MB',
      uploadedBy: 'Admin User',
      uploadDate: '2024-01-15',
      tags: ['resolution', 'official', '2024'],
    },
    {
      id: 2,
      name: 'Budget Report Q1 2024',
      type: 'Excel',
      category: 'Financial',
      size: '1.8 MB',
      uploadedBy: 'Finance Officer',
      uploadDate: '2024-01-20',
      tags: ['budget', 'financial', 'quarterly'],
    },
    {
      id: 3,
      name: 'Community Project Proposal',
      type: 'Word',
      category: 'Projects',
      size: '3.2 MB',
      uploadedBy: 'Project Manager',
      uploadDate: '2024-01-22',
      tags: ['project', 'proposal', 'community'],
    },
    {
      id: 4,
      name: 'Meeting Minutes January 2024',
      type: 'PDF',
      category: 'Minutes',
      size: '890 KB',
      uploadedBy: 'Secretary',
      uploadDate: '2024-01-25',
      tags: ['meeting', 'minutes', 'january'],
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <File className="w-5 h-5 text-red-500" />;
      case 'excel':
        return <File className="w-5 h-5 text-green-500" />;
      case 'word':
        return <File className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
    setShowViewModal(true);
  };

  const handleDownload = (document: Document) => {
    console.log('Download document:', document.name);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      console.log('Delete document:', id);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Document Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Store and manage barangay documents</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statistics.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</span>
              <FileText className={`w-5 h-5 text-${stat.color}-500`} />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
              <span className="text-green-600 dark:text-green-400 text-sm">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents by name or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="Resolutions">Resolutions</option>
            <option value="Financial">Financial</option>
            <option value="Projects">Projects</option>
            <option value="Minutes">Minutes</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="PDF">PDF</option>
            <option value="Word">Word</option>
            <option value="Excel">Excel</option>
          </select>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(doc.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{doc.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{doc.size}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Folder className="w-4 h-4" />
                  <span>{doc.category}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {doc.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                  Uploaded by {doc.uploadedBy} on {doc.uploadDate}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(doc)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Document</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Document Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter document name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    <option value="">Select category</option>
                    <option value="Resolutions">Resolutions</option>
                    <option value="Financial">Financial</option>
                    <option value="Projects">Projects</option>
                    <option value="Minutes">Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    File
                  </label>
                  <input
                    type="file"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. official, budget, 2024"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Document Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Document Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedDocument.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedDocument.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Size
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedDocument.size}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedDocument.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {selectedDocument.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Uploaded By
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedDocument.uploadedBy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload Date
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedDocument.uploadDate}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(selectedDocument)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
