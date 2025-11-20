import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import ClearanceStats from '@/components/clearances/ClearanceStats';
import ClearanceFilters from '@/components/clearances/ClearanceFilters';
import ClearanceTable from '@/components/clearances/ClearanceTable';
import ClearanceFormModal from '@/components/clearances/ClearanceFormModal';
import DeleteConfirmModal from '@/components/clearances/DeleteConfirmModal';
import Notification from '@/components/clearances/Notification';
import Pagination from '@/components/clearances/Pagination';

interface Clearance {
  id: string;
  documentNumber: string;
  residentId?: string;
  residentName: string;
  purpose: string;
  validityPeriod?: number;
  issueDate: string;
  expiryDate?: string;
  status: string;
  requestedDate: string;
  requestDate: string;
  approvedDate?: string;
  approvedBy?: string;
  issuedBy?: string;
  processedBy: string;
  feeAmount: number;
  orNumber?: string;
  paymentDate?: string;
  paymentStatus: string;
  remarks?: string;
  clearanceType: string;
  cedulaNumber?: string;
  cedulaDate?: string;
  cedulaPlace?: string;
  hasPendingCase: boolean;
  caseDetails?: string;
  clearanceStatus: string;
  verifiedBy?: string;
  verifiedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Statistics {
  totalClearances: number;
  totalPending: number;
  totalIssued: number;
  totalRevenue: number;
  totalApproved: number;
  totalRejected: number;
  totalReleased: number;
}

// Clearance types configuration
const CLEARANCE_TYPES = [
  { value: 'Barangay Clearance', label: 'Barangay Clearance', description: 'General purpose clearance', fee: 50, icon: FileText },
  { value: 'Certificate of Residency', label: 'Certificate of Residency', description: 'Proof of residency', fee: 30, icon: FileText },
  { value: 'Indigency Certificate', label: 'Indigency Certificate', description: 'For low-income residents', fee: 20, icon: FileText },
  { value: 'Business Clearance', label: 'Business Clearance', description: 'For businesses operating in barangay', fee: 200, icon: FileText },
  { value: 'Good Moral Certificate', label: 'Good Moral / Good Standing Certificate', description: 'Certificate of good moral character', fee: 40, icon: FileText },
  { value: 'Permit for Events/Construction', label: 'Permit for Events or Construction', description: 'Required for events or construction', fee: 150, icon: FileText },
];

export default function ClearancesPage() {
  const [clearances, setClearances] = useState<Clearance[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalClearances: 0,
    totalPending: 0,
    totalIssued: 0,
    totalRevenue: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalReleased: 0,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clearanceTypeFilter, setClearanceTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedClearance, setSelectedClearance] = useState<Clearance | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingClearances, setFetchingClearances] = useState(true);

  // Fetch clearances from API
  const fetchClearances = async () => {
    setFetchingClearances(true);
    try {
      const response = await fetch('/api/clearances');
      if (response.ok) {
        const data = await response.json();
        setClearances(data);
      } else {
        console.error('Failed to fetch clearances');
        setNotification({ type: 'error', message: 'Failed to load clearances' });
      }
    } catch (error) {
      console.error('Error fetching clearances:', error);
      setNotification({ type: 'error', message: 'Error loading clearances' });
    } finally {
      setFetchingClearances(false);
    }
  };

  // Fetch statistics from API
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/clearances/stats');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchClearances();
    fetchStatistics();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filter clearances
  const filteredClearances = clearances.filter((clearance: Clearance) => {
    const matchesSearch = clearance.residentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clearance.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clearance.clearanceType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusFilter === 'All' || clearance.status === statusFilter;
    const matchesClearanceType = clearanceTypeFilter === 'all' || clearance.clearanceType === clearanceTypeFilter;
    return matchesSearch && matchesStatus && matchesClearanceType;
  });

  // Paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedClearances = filteredClearances.slice(indexOfFirstItem, indexOfLastItem);

  // Handle form submit
  const handleFormSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const apiData = {
        resident_id: formData.residentId,
        resident_name: formData.residentName,
        clearance_type: formData.clearanceType,
        purpose: formData.purpose,
        fee_amount: formData.feeAmount,
        payment_status: formData.paymentStatus || 'Unpaid',
        status: formData.status || 'Pending',
        or_number: formData.orNumber,
        has_pending_case: formData.hasPendingCase || false,
        case_details: formData.caseDetails,
        remarks: formData.remarks,
        clearance_status: formData.clearanceStatus || 'Pending',
      };

      let response;
      if (modalMode === 'create') {
        response = await fetch('/api/clearances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData),
        });
      } else {
        response = await fetch(`/api/clearances/${selectedClearance?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData),
        });
      }

      if (response.ok) {
        setNotification({ 
          type: 'success', 
          message: modalMode === 'create' ? 'Clearance request created successfully!' : 'Clearance updated successfully!' 
        });
        setShowModal(false);
        fetchClearances();
        fetchStatistics();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to save clearance' });
      }
    } catch (error) {
      console.error('Error saving clearance:', error);
      setNotification({ type: 'error', message: 'Error saving clearance' });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clearances/${selectedClearance?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Clearance request deleted successfully!' });
        setShowDeleteModal(false);
        setSelectedClearance(null);
        fetchClearances();
        fetchStatistics();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to delete clearance' });
      }
    } catch (error) {
      console.error('Error deleting clearance:', error);
      setNotification({ type: 'error', message: 'Error deleting clearance' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Clearances Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage barangay clearance requests and certificates</p>
      </div>

      {/* Statistics */}
      <ClearanceStats statistics={statistics} />

      {/* Clearances List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Clearance Requests</h2>
        </div>

        <div className="p-6">
          <ClearanceFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            clearanceTypeFilter={clearanceTypeFilter}
            setClearanceTypeFilter={setClearanceTypeFilter}
            clearanceTypes={CLEARANCE_TYPES}
            onNewClearance={() => {
              setModalMode('create');
              setSelectedClearance({
                clearanceType: 'Barangay Clearance',
                status: 'Pending',
                paymentStatus: 'Unpaid',
                feeAmount: 50,
                hasPendingCase: false,
                clearanceStatus: 'Pending',
              } as any);
              setShowModal(true);
            }}
          />

          {fetchingClearances ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading clearances...</p>
            </div>
          ) : (
            <ClearanceTable
              clearances={paginatedClearances}
              onView={(clearance) => {
                // Implement view certificate modal
                console.log('View certificate:', clearance);
              }}
              onEdit={(clearance) => {
                setSelectedClearance(clearance);
                setModalMode('edit');
                setShowModal(true);
              }}
              onDelete={(clearance) => {
                setSelectedClearance(clearance);
                setShowDeleteModal(true);
              }}
              onPrint={(clearance) => {
                setSelectedClearance(clearance);
                window.print();
              }}
            />
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredClearances.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals */}
      <ClearanceFormModal
        isOpen={showModal}
        mode={modalMode}
        clearance={selectedClearance}
        clearanceTypes={CLEARANCE_TYPES}
        onClose={() => {
          setShowModal(false);
          setSelectedClearance(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        residentName={selectedClearance?.residentName || ''}
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedClearance(null);
        }}
      />

      {/* Notification */}
      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}
    </div>
  );
}
