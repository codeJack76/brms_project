'use client';

import { useState, useMemo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Resident,
  ResidentFormData,
  ResidentStats,
  SortField,
  SortDirection,
  calculateAge,
  getFullName,
  ResidentStatsCards,
  ResidentFilters,
  ResidentTable,
  ResidentViewModal,
  ResidentFormModal,
  DeleteConfirmModal,
  Pagination,
} from '../../components/residents';
import { demoResidents } from '@/lib/demoData';

// Convert demo data to match Resident type
const convertedDemoResidents: Resident[] = demoResidents.map(r => ({
  ...r,
  is_active: true,
  mobile: r.contact_number,
})) as Resident[];

interface ResidentsPageProps {
  isDemoMode?: boolean;
}

export default function ResidentsPage({ isDemoMode = false }: ResidentsPageProps) {
  const [residents, setResidents] = useState<Resident[]>(isDemoMode ? convertedDemoResidents : []);
  const [isLoading, setIsLoading] = useState(!isDemoMode);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentFormData | null>(null);
  const [deleteResident, setDeleteResident] = useState<Resident | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch residents on mount
  useEffect(() => {
    if (!isDemoMode) {
      fetchResidents();
    }
  }, [isDemoMode]);

  const fetchResidents = async () => {
    if (isDemoMode) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/residents');
      const data = await response.json();
      
      if (response.ok) {
        setResidents(data.residents || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch residents');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch residents';
      setError(message);
      console.error('Error fetching residents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResident = async (data: ResidentFormData) => {
    try {
      if (data.id) {
        // Update existing resident
        const response = await fetch(`/api/residents/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update resident');
        }

        const result = await response.json();
        setResidents(prev => prev.map(r => r.id === data.id ? result.resident : r));
      } else {
        // Create new resident
        const response = await fetch('/api/residents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create resident');
        }

        const result = await response.json();
        setResidents(prev => [result.resident, ...prev]);
      }
      
      setEditingResident(null);
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save resident';
      console.error('Error saving resident:', err);
      alert(message);
      throw err;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteResident) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/residents/${deleteResident.id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete resident');
      }
      
      setResidents((prev) => prev.filter((r) => r.id !== deleteResident.id));
      setDeleteResident(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete resident';
      console.error('Error deleting resident:', err);
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewResident = (resident: Resident) => {
    setSelectedResident(resident);
    setShowViewModal(true);
  };

  const handleEditResident = (resident: Resident) => {
    setEditingResident({
      id: resident.id,
      barangay_id: resident.barangay_id,
      first_name: resident.first_name,
      middle_name: resident.middle_name || undefined,
      last_name: resident.last_name,
      suffix: resident.suffix || undefined,
      gender: resident.gender || undefined,
      birth_date: resident.birth_date || undefined,
      civil_status: resident.civil_status || undefined,
      nationality: resident.nationality || undefined,
      occupation: resident.occupation || undefined,
      email: resident.email || undefined,
      mobile: resident.mobile || undefined,
      address: resident.address || undefined,
      purok: resident.purok || undefined,
      is_active: resident.is_active
    });
    setIsCreateModalOpen(true);
  };

  const handleEditFromView = (formData: ResidentFormData) => {
    setEditingResident(formData);
    setIsCreateModalOpen(true);
  };

  // Transform resident for table display
  const transformResidentForTable = (resident: Resident) => ({
    ...resident,
    dateOfBirth: resident.birth_date || '',
    phone: resident.mobile,
    status: resident.is_active ? 'Active' as const : 'Inactive' as const,
  });

  const filteredAndSortedResidents = useMemo(() => {
    let result = [...residents];

    if (searchTerm) {
      result = result.filter((r) => {
        const fullName = getFullName(r).toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return fullName.includes(searchLower) ||
          (r.address || '').toLowerCase().includes(searchLower) ||
          (r.email || '').toLowerCase().includes(searchLower) ||
          (r.mobile || '').includes(searchTerm);
      });
    }

    if (filterGender) {
      result = result.filter((r) => r.gender === filterGender);
    }
    if (filterStatus) {
      const isActive = filterStatus === 'Active';
      result = result.filter((r) => r.is_active === isActive);
    }

    if (sortField) {
      result.sort((a, b) => {
        let aVal: string | boolean | null | undefined;
        let bVal: string | boolean | null | undefined;

        switch (sortField) {
          case 'lastName':
            aVal = a.last_name?.toLowerCase();
            bVal = b.last_name?.toLowerCase();
            break;
          case 'gender':
            aVal = a.gender?.toLowerCase();
            bVal = b.gender?.toLowerCase();
            break;
          case 'dateOfBirth':
            aVal = a.birth_date;
            bVal = b.birth_date;
            break;
          case 'status':
            aVal = a.is_active ? 'active' : 'inactive';
            bVal = b.is_active ? 'active' : 'inactive';
            break;
          default:
            return 0;
        }
        
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [residents, searchTerm, filterGender, filterStatus, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedResidents.length / pageSize);
  const paginatedResidents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedResidents.slice(start, start + pageSize);
  }, [filteredAndSortedResidents, currentPage, pageSize]);

  const stats: ResidentStats = useMemo(() => ({
    total: residents.length,
    male: residents.filter(r => r.gender === 'Male').length,
    female: residents.filter(r => r.gender === 'Female').length,
    active: residents.filter(r => r.is_active).length,
    avgAge: residents.length > 0 
      ? Math.round(residents.reduce((sum, r) => sum + calculateAge(r.birth_date), 0) / residents.length)
      : 0
  }), [residents]);

  // Transform residents for table display
  const tableResidents = paginatedResidents.map(transformResidentForTable);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Residents Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive barangay residents database</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading residents...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button 
              onClick={fetchResidents}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Statistics */}
          <ResidentStatsCards stats={stats} />

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Filters */}
            <ResidentFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterGender={filterGender}
              onFilterGenderChange={setFilterGender}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              onAddNew={() => {
                setEditingResident(null);
                setIsCreateModalOpen(true);
              }}
            />

            {/* Table */}
            <ResidentTable
              residents={tableResidents}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onView={handleViewResident}
              onEdit={handleEditResident}
              onDelete={(resident) => setDeleteResident(resident)}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredAndSortedResidents.length}
              itemsPerPage={pageSize}
              itemName="residents"
            />
          </div>

          {/* View Modal */}
          <ResidentViewModal
            resident={selectedResident}
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            onEdit={handleEditFromView}
          />

          {/* Create / Edit Modal */}
          <ResidentFormModal
            isOpen={isCreateModalOpen}
            onClose={() => { setIsCreateModalOpen(false); setEditingResident(null); }}
            onSave={handleSaveResident}
            initialData={editingResident}
            title={editingResident?.id ? 'Edit Resident' : 'Add New Resident'}
          />

          {/* Delete Confirm Modal */}
          <DeleteConfirmModal
            resident={deleteResident}
            isOpen={!!deleteResident}
            onClose={() => setDeleteResident(null)}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
          />
        </>
      )}
    </div>
  );
}
