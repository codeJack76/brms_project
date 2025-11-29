'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BlotterStatsCards,
  BlotterFilters,
  BlotterTable,
  BlotterPagination,
  BlotterViewModal,
  BlotterFormModal,
  BlotterRecord,
  BlotterFormData,
  BlotterStatistics,
} from '@/components/blotter';

export default function BlotterPage() {
  // State
  const [records, setRecords] = useState<BlotterRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedRecord, setSelectedRecord] = useState<BlotterRecord | null>(null);
  const [formData, setFormData] = useState<BlotterFormData>({
    complainant: '',
    respondent: '',
    incidentType: '',
    incidentDate: new Date().toISOString().split('T')[0],
    location: '',
    status: 'pending',
    filedDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    remarks: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch blotter records
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/blotter');
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        let errorMessage = 'Failed to load blotter records';
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        }
        console.error('Failed to fetch blotter records:', errorMessage);
        setNotification({ type: 'error', message: errorMessage });
        return;
      }
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching blotter records:', error);
      setNotification({ type: 'error', message: 'Error loading blotter records' });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  // Calculate statistics
  const statistics: BlotterStatistics = useMemo(() => ({
    totalCases: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    investigating: records.filter(r => r.status === 'investigating').length,
    resolved: records.filter(r => r.status === 'resolved').length,
    dismissed: records.filter(r => r.status === 'dismissed').length,
  }), [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.complainant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.respondent?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
      const matchesType = selectedType === 'all' || record.incidentType === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [records, searchTerm, selectedStatus, selectedType]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  // Handlers
  const handleView = (record: BlotterRecord) => {
    setSelectedRecord(record);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (record: BlotterRecord) => {
    setSelectedRecord(record);
    setFormData({
      complainant: record.complainant,
      respondent: record.respondent,
      incidentType: record.incidentType,
      incidentDate: record.incidentDate,
      location: record.location || '',
      status: record.status,
      filedDate: record.filedDate,
      assignedTo: record.assignedTo || '',
      remarks: record.remarks || '',
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormData({
      complainant: '',
      respondent: '',
      incidentType: '',
      incidentDate: new Date().toISOString().split('T')[0],
      location: '',
      status: 'pending',
      filedDate: new Date().toISOString().split('T')[0],
      assignedTo: '',
      remarks: '',
    });
    setFormErrors({});
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blotter record?')) return;

    try {
      const response = await fetch(`/api/blotter/${id}`, { method: 'DELETE' });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Blotter record deleted successfully!' });
        fetchRecords();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to delete record' });
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      setNotification({ type: 'error', message: 'Error deleting record' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const errors: Record<string, string> = {};
    if (!formData.complainant.trim()) errors.complainant = 'Complainant is required';
    if (!formData.respondent.trim()) errors.respondent = 'Respondent is required';
    if (!formData.incidentType) errors.incidentType = 'Incident type is required';
    if (!formData.incidentDate) errors.incidentDate = 'Incident date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const apiData = {
        complainant: formData.complainant,
        respondent: formData.respondent,
        incident_type: formData.incidentType,
        incident_date: formData.incidentDate,
        location: formData.location || null,
        status: formData.status,
        filed_date: formData.filedDate,
        assigned_to: formData.assignedTo || null,
        remarks: formData.remarks || null,
      };

      let response;
      if (modalMode === 'create') {
        response = await fetch('/api/blotter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData),
        });
      } else {
        response = await fetch(`/api/blotter/${selectedRecord?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData),
        });
      }

      if (response.ok) {
        setNotification({
          type: 'success',
          message: modalMode === 'create' ? 'Blotter record created successfully!' : 'Blotter record updated successfully!'
        });
        setShowModal(false);
        setFormData({
          complainant: '',
          respondent: '',
          incidentType: '',
          incidentDate: '',
          location: '',
          status: 'pending',
          filedDate: new Date().toISOString().split('T')[0],
          assignedTo: '',
          remarks: '',
        });
        setFormErrors({});
        fetchRecords();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to save record' });
      }
    } catch (error) {
      console.error('Error saving record:', error);
      setNotification({ type: 'error', message: 'Error saving record' });
    } finally {
      setSaving(false);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  // Update status handler
  const handleUpdateStatus = async (record: BlotterRecord, newStatus: string) => {
    try {
      const response = await fetch(`/api/blotter/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setNotification({ type: 'success', message: `Status updated to ${newStatus}` });
        fetchRecords();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to update status' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification({ type: 'error', message: 'Error updating status' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Blotter Records</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage incident reports and cases</p>
      </div>

      {/* Statistics */}
      <BlotterStatsCards stats={statistics} />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading records...</span>
        </div>
      )}

      {!isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Filters */}
          <BlotterFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onCreateNew={handleCreate}
          />

          {/* Table */}
          <BlotterTable
            records={paginatedRecords}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          <BlotterPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRecords.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* View Modal */}
      {showModal && modalMode === 'view' && selectedRecord && (
        <BlotterViewModal
          record={selectedRecord}
          onClose={() => setShowModal(false)}
          onEdit={handleEdit}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Form Modal (Create/Edit) */}
      {showModal && (modalMode === 'create' || modalMode === 'edit') && (
        <BlotterFormModal
          mode={modalMode}
          formData={formData}
          formErrors={formErrors}
          saving={saving}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
