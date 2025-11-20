'use client';

import { useState } from 'react';
import { FileText, Search, Filter, Plus, Eye, Edit2, Trash2, Download, Calendar, User, MapPin, AlertCircle } from 'lucide-react';

interface BlotterRecord {
  id: number;
  caseNumber: string;
  complainant: string;
  respondent: string;
  incidentType: string;
  incidentDate: string;
  location: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  filedDate: string;
  assignedTo: string;
}

interface Statistics {
  label: string;
  value: string;
  change: string;
  color: string;
}

export default function BlotterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BlotterRecord | null>(null);

  const statistics: Statistics[] = [
    { label: 'Total Cases', value: '234', change: '+12%', color: 'blue' },
    { label: 'Active Cases', value: '45', change: '+8%', color: 'yellow' },
    { label: 'Resolved', value: '167', change: '+15%', color: 'green' },
    { label: 'This Month', value: '23', change: '+5%', color: 'purple' },
  ];

  const blotterRecords: BlotterRecord[] = [
    {
      id: 1,
      caseNumber: 'BLT-2024-001',
      complainant: 'Juan Dela Cruz',
      respondent: 'Pedro Santos',
      incidentType: 'Physical Injury',
      incidentDate: '2024-01-15',
      location: 'Purok 1',
      status: 'investigating',
      filedDate: '2024-01-16',
      assignedTo: 'Brgy. Captain',
    },
    {
      id: 2,
      caseNumber: 'BLT-2024-002',
      complainant: 'Maria Garcia',
      respondent: 'Jose Reyes',
      incidentType: 'Verbal Threat',
      incidentDate: '2024-01-18',
      location: 'Purok 2',
      status: 'resolved',
      filedDate: '2024-01-18',
      assignedTo: 'Brgy. Kagawad',
    },
    {
      id: 3,
      caseNumber: 'BLT-2024-003',
      complainant: 'Ana Lopez',
      respondent: 'Carlos Martinez',
      incidentType: 'Property Damage',
      incidentDate: '2024-01-20',
      location: 'Purok 3',
      status: 'pending',
      filedDate: '2024-01-21',
      assignedTo: 'Brgy. Secretary',
    },
    {
      id: 4,
      caseNumber: 'BLT-2024-004',
      complainant: 'Roberto Cruz',
      respondent: 'Miguel Fernandez',
      incidentType: 'Noise Complaint',
      incidentDate: '2024-01-22',
      location: 'Purok 1',
      status: 'dismissed',
      filedDate: '2024-01-22',
      assignedTo: 'Brgy. Tanod',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'investigating':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleView = (record: BlotterRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEdit = (record: BlotterRecord) => {
    setSelectedRecord(record);
    setShowAddModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this blotter record?')) {
      console.log('Delete record:', id);
    }
  };

  const filteredRecords = blotterRecords.filter((record) => {
    const matchesSearch =
      record.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.complainant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.respondent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    const matchesType = selectedType === 'all' || record.incidentType === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Blotter Records</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage incident reports and cases</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statistics.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</span>
              <AlertCircle className={`w-5 h-5 text-${stat.color}-500`} />
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
                placeholder="Search by case number, complainant, or respondent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="Physical Injury">Physical Injury</option>
            <option value="Verbal Threat">Verbal Threat</option>
            <option value="Property Damage">Property Damage</option>
            <option value="Noise Complaint">Noise Complaint</option>
          </select>

          {/* Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Record
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Case Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Complainant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Respondent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Incident Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {record.caseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {record.complainant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {record.respondent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {record.incidentType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {record.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(record)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
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
      </div>

      {/* View Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Case Details</h2>
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
                    Case Number
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedRecord.caseNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Complainant
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedRecord.complainant}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Respondent
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedRecord.respondent}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Incident Type
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedRecord.incidentType}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Incident Date
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedRecord.incidentDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedRecord.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Filed Date
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedRecord.filedDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assigned To
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedRecord.assignedTo}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRecord.status)}`}>
                    {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
