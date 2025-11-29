import { useState, useEffect } from 'react';
import { Search, Plus, FileText, Clock, CheckCircle, XCircle, Printer, Eye, Edit, Trash2, X, AlertCircle, Calendar, DollarSign, User, ClipboardList } from 'lucide-react';

interface Clearance {
  id: string;
  barangayId?: string;
  clearanceNumber: string;
  residentId?: string;
  residentName: string;
  typeOfClearance: 'Barangay Clearance' | 'Barangay Certificate of Residency' | 'Barangay Indigency' | 'Barangay Good Moral' | 'Barangay Business Clearance';
  purposeOfClearance: string;
  dateRequested: string;
  dateApproved?: string;
  dateReleased?: string;
  status: 'Pending' | 'Approved' | 'Released';
  processingOfficer?: string;
  clearanceFeePaid: boolean;
  amountPaid?: number;
  requestPaid?: boolean;
  cedulaNumber?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Resident interface for search
interface Resident {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  address?: string;
  contact_number?: string;
}

// Clearance types configuration - matching database schema
const CLEARANCE_TYPES = [
  { 
    value: 'Barangay Clearance', 
    label: 'Barangay Clearance',
    description: 'General purpose clearance',
    fee: 50,
    icon: FileText
  },
  { 
    value: 'Barangay Certificate of Residency', 
    label: 'Certificate of Residency',
    description: 'Proof of residency',
    fee: 30,
    icon: FileText
  },
  { 
    value: 'Barangay Indigency', 
    label: 'Indigency Certificate',
    description: 'For low-income residents',
    fee: 0,
    icon: FileText
  },
  { 
    value: 'Barangay Good Moral', 
    label: 'Good Moral Certificate',
    description: 'Certificate of good moral character',
    fee: 40,
    icon: FileText
  },
  { 
    value: 'Barangay Business Clearance', 
    label: 'Business Clearance',
    description: 'For businesses operating in barangay',
    fee: 200,
    icon: FileText
  },
] as const;

interface Statistics {
  totalClearances: number;
  totalPending: number;
  totalApproved: number;
  totalReleased: number;
  totalPaid: number;
  totalUnpaid: number;
  totalRevenue: number;
  byType?: {
    barangayClearance: number;
    businessClearance: number;
    residencyCertificate: number;
    indigencyCertificate: number;
  };
}

interface PurposeBreakdown {
  purpose: string;
  count: number;
  percentage: number;
}

type ModalMode = 'view' | 'create' | 'edit' | 'delete' | 'certificate';

export default function ClearancesPage() {
  const [clearances, setClearances] = useState<Clearance[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalClearances: 0,
    totalPending: 0,
    totalApproved: 0,
    totalReleased: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalRevenue: 0,
  });
  const [purposeBreakdown, setPurposeBreakdown] = useState<PurposeBreakdown[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clearanceTypeFilter, setClearanceTypeFilter] = useState('all');
  const [selectedClearance, setSelectedClearance] = useState<Clearance | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [formData, setFormData] = useState<Partial<Clearance>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingClearances, setFetchingClearances] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Resident search state
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentSearchTerm, setResidentSearchTerm] = useState('');
  const [showResidentDropdown, setShowResidentDropdown] = useState(false);
  const [searchingResidents, setSearchingResidents] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  // Fetch clearances from API
  const fetchClearances = async () => {
    setFetchingClearances(true);
    try {
      const response = await fetch('/api/clearances');
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        let errorMessage = 'Failed to load clearances';
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        console.error('Failed to fetch clearances:', errorMessage);
        setNotification({ type: 'error', message: errorMessage });
        return;
      }
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        setClearances(data);
      } else {
        console.error('Unexpected response type:', contentType);
        setNotification({ type: 'error', message: 'Unexpected server response' });
      }
    } catch (error) {
      console.error('Error fetching clearances:', error);
      setNotification({ type: 'error', message: 'Error loading clearances. Please check your connection.' });
    } finally {
      setFetchingClearances(false);
    }
  };

  // Fetch statistics from API
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/clearances/stats');
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType?.includes('application/json')) {
        const data = await response.json();
        setStatistics(data.statistics);
        setPurposeBreakdown(data.purposeBreakdown || []);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Search residents by name
  const searchResidents = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResidents([]);
      return;
    }
    
    setSearchingResidents(true);
    try {
      const response = await fetch('/api/residents');
      if (response.ok) {
        const data = await response.json();
        const filteredResidents = (data.residents || []).filter((resident: Resident) => {
          const fullName = `${resident.first_name} ${resident.middle_name || ''} ${resident.last_name} ${resident.suffix || ''}`.toLowerCase();
          return fullName.includes(searchQuery.toLowerCase());
        });
        setResidents(filteredResidents.slice(0, 10)); // Limit to 10 results
      }
    } catch (error) {
      console.error('Error searching residents:', error);
    } finally {
      setSearchingResidents(false);
    }
  };

  // Get full name from resident
  const getResidentFullName = (resident: Resident) => {
    const parts = [resident.first_name];
    if (resident.middle_name) parts.push(resident.middle_name);
    parts.push(resident.last_name);
    if (resident.suffix) parts.push(resident.suffix);
    return parts.join(' ');
  };

  // Load data on mount
  useEffect(() => {
    fetchClearances();
    fetchStatistics();
  }, []);

  // Handle delete clearance
  const handleDeleteClearance = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clearances/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Clearance deleted successfully!' });
        setShowModal(false);
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
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle approve clearance
  const handleApproveClearance = async (clearance: Clearance) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clearances/${clearance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Approved',
          date_approved: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Clearance approved successfully!' });
        fetchClearances();
        fetchStatistics();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to approve clearance' });
      }
    } catch (error) {
      console.error('Error approving clearance:', error);
      setNotification({ type: 'error', message: 'Error approving clearance' });
    } finally {
      setLoading(false);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle release clearance
  const handleReleaseClearance = async (clearance: Clearance) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clearances/${clearance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Released',
          date_released: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Clearance released successfully!' });
        fetchClearances();
        fetchStatistics();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to release clearance' });
      }
    } catch (error) {
      console.error('Error releasing clearance:', error);
      setNotification({ type: 'error', message: 'Error releasing clearance' });
    } finally {
      setLoading(false);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  // Use clearances from API
  const dataSource = clearances;

  const filteredClearances = dataSource.filter((clearance: Clearance) => {
    const matchesSearch = clearance.residentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clearance.purposeOfClearance?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clearance.typeOfClearance?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clearance.clearanceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusFilter === 'All' || clearance.status === statusFilter;
    const matchesClearanceType = clearanceTypeFilter === 'all' || clearance.typeOfClearance === clearanceTypeFilter;
    return matchesSearch && matchesStatus && matchesClearanceType;
  });

  // Paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedClearances = filteredClearances.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700';
      case 'Pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700';
      case 'Released':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700';
      case 'Rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'Released':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Clearance Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Process and track barangay clearance requests</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Total Requests</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalClearances}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Pending</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <span className="text-2xl font-bold text-yellow-600">{statistics.totalPending}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Approved</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-2xl font-bold text-green-600">{statistics.totalApproved}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Released</span>
            <CheckCircle className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-blue-600">{statistics.totalReleased}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Revenue</span>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-2xl font-bold text-purple-600">₱{statistics.totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Loading State */}
      {fetchingClearances && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading clearances...</span>
        </div>
      )}

      {!fetchingClearances && (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button 
              onClick={() => {
                setModalMode('create');
                setFormData({
                  typeOfClearance: 'Barangay Clearance',
                  status: 'Pending',
                  clearanceFeePaid: false,
                  amountPaid: 50,
                });
                setSelectedResident(null);
                setResidentSearchTerm('');
                setResidents([]);
                setShowModal(true);
              }}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Clearance Request</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
              {['All', 'Pending', 'Approved', 'Released'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
              <select
                value={clearanceTypeFilter}
                onChange={(e) => setClearanceTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Types</option>
                {CLEARANCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resident Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clearance Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedClearances.map((clearance) => (
                <tr key={clearance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {clearance.clearanceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{clearance.residentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                      {clearance.typeOfClearance}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{clearance.purposeOfClearance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    ₱{(clearance.amountPaid || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(clearance.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(clearance.status)}`}>
                        {clearance.status}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedClearance(clearance);
                          setShowCertificate(true);
                        }}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        title="View Certificate"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClearance(clearance);
                          setFormData(clearance);
                          setModalMode('edit');
                          setShowModal(true);
                        }}
                        className="p-1 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {clearance.status === 'Released' && (
                        <button 
                          onClick={() => {
                            setSelectedClearance(clearance);
                            window.print();
                          }}
                          className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:bg-green-900/30 rounded" 
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedClearance(clearance);
                          setModalMode('delete');
                          setShowModal(true);
                        }}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
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

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {fetchingClearances ? 'Loading...' : `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, filteredClearances.length)} to ${Math.min(currentPage * itemsPerPage, filteredClearances.length)} of ${filteredClearances.length} clearances`}
          </p>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-700/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.ceil(filteredClearances.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-700/50'}`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(Math.min(Math.ceil(filteredClearances.length / itemsPerPage), currentPage + 1))}
              disabled={currentPage >= Math.ceil(filteredClearances.length / itemsPerPage)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-700/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {modalMode === 'create' ? 'New Clearance Request' : 'Edit Clearance'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {modalMode === 'create' ? 'Create a new barangay clearance request' : 'Update clearance information'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({});
                    setFormErrors({});
                    setSelectedResident(null);
                    setResidentSearchTerm('');
                    setResidents([]);
                  }}
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const errors: Record<string, string> = {};
                
                if (!formData.residentName && !formData.residentId) errors.residentName = 'Resident name or ID is required';
                if (!formData.typeOfClearance) errors.typeOfClearance = 'Clearance type is required';
                if (!formData.purposeOfClearance) errors.purposeOfClearance = 'Purpose is required';
                
                if (Object.keys(errors).length > 0) {
                  setFormErrors(errors);
                  return;
                }
                
                setLoading(true);
                try {
                  // Map form data to API format (snake_case for database)
                  const apiData = {
                    resident_id: formData.residentId,
                    resident_name: formData.residentName,
                    type_of_clearance: formData.typeOfClearance,
                    purpose_of_clearance: formData.purposeOfClearance,
                    status: formData.status || 'Pending',
                    processing_officer: formData.processingOfficer,
                    clearance_fee_paid: formData.clearanceFeePaid || false,
                    amount_paid: formData.amountPaid || 0,
                    cedula_number: formData.cedulaNumber,
                    remarks: formData.remarks,
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
                      message: modalMode === 'create' 
                        ? 'Clearance request created successfully!' 
                        : 'Clearance updated successfully!' 
                    });
                    setShowModal(false);
                    setFormData({});
                    setFormErrors({});
                    setSelectedResident(null);
                    setResidentSearchTerm('');
                    setResidents([]);
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
                setTimeout(() => setNotification(null), 3000);
              }}>
                <div className="space-y-8">
                  {/* Resident Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resident Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Resident Search */}
                      <div className="md:col-span-2 relative space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          Search Resident <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={residentSearchTerm}
                            onChange={(e) => {
                              setResidentSearchTerm(e.target.value);
                              searchResidents(e.target.value);
                              setShowResidentDropdown(true);
                            }}
                            onFocus={() => {
                              if (residentSearchTerm.length >= 2) {
                                setShowResidentDropdown(true);
                              }
                            }}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Type at least 2 characters to search residents..."
                            disabled={loading}
                      />
                      {searchingResidents && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Resident Dropdown */}
                    {showResidentDropdown && residents.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {residents.map((resident) => (
                          <button
                            key={resident.id}
                            type="button"
                            onClick={() => {
                              const fullName = getResidentFullName(resident);
                              setSelectedResident(resident);
                              setResidentSearchTerm(fullName);
                              setFormData({ 
                                ...formData, 
                                residentId: resident.id,
                                residentName: fullName 
                              });
                              setShowResidentDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900 dark:text-white">
                              {getResidentFullName(resident)}
                            </div>
                            {resident.address && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {resident.address}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* No results message */}
                    {showResidentDropdown && residentSearchTerm.length >= 2 && residents.length === 0 && !searchingResidents && (
                      <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
                        No residents found. You can still enter the name manually below.
                      </div>
                    )}
                    
                    {/* Selected resident display */}
                    {selectedResident && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-blue-900 dark:text-blue-100">
                              {getResidentFullName(selectedResident)}
                            </p>
                            {selectedResident.contact_number && (
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                Contact: {selectedResident.contact_number}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedResident(null);
                              setResidentSearchTerm('');
                              setFormData({ ...formData, residentId: undefined, residentName: '' });
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {formErrors.residentName && (
                      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.residentName}</span>
                      </div>
                    )}
                  </div>

                  {/* Manual Resident Name (if not selected from search) */}
                  {!selectedResident && (
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Or Enter Name Manually
                      </label>
                      <input
                        type="text"
                        value={formData.residentName || ''}
                        onChange={(e) => setFormData({ ...formData, residentName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter resident name if not found in search"
                        disabled={loading}
                      />
                    </div>
                  )}
                    </div>
                  </div>

                  {/* Request Details Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Clearance Type */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          Clearance Type <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          value={formData.typeOfClearance || ''}
                          onChange={(e) => {
                            const selectedType = CLEARANCE_TYPES.find(t => t.value === e.target.value);
                            setFormData({ 
                              ...formData, 
                              typeOfClearance: e.target.value as any,
                              amountPaid: selectedType?.fee || 0
                            });
                          }}
                          className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            formErrors.typeOfClearance ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          disabled={loading}
                        >
                          {CLEARANCE_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label} - ₱{type.fee}
                            </option>
                          ))}
                        </select>
                        {formErrors.typeOfClearance && (
                          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{formErrors.typeOfClearance}</span>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </label>
                        <select
                          value={formData.status || 'Pending'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Pending' | 'Approved' | 'Released' })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          disabled={loading}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Released">Released</option>
                        </select>
                      </div>

                      {/* Purpose */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          Purpose <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.purposeOfClearance || ''}
                          onChange={(e) => setFormData({ ...formData, purposeOfClearance: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            formErrors.purposeOfClearance ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="e.g., Employment, Business Permit, Medical Assistance"
                          disabled={loading}
                        />
                        {formErrors.purposeOfClearance && (
                          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{formErrors.purposeOfClearance}</span>
                          </div>
                        )}
                      </div>

                      {/* Cedula Number */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Cedula Number
                        </label>
                        <input
                          type="text"
                          value={formData.cedulaNumber || ''}
                          onChange={(e) => setFormData({ ...formData, cedulaNumber: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Cedula Number"
                          disabled={loading}
                        />
                      </div>

                      {/* Processing Officer */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Processing Officer
                        </label>
                        <input
                          type="text"
                          value={formData.processingOfficer || ''}
                          onChange={(e) => setFormData({ ...formData, processingOfficer: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Processing Officer Name"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Fee Amount */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">₱</span>
                          <input
                            type="number"
                            value={formData.amountPaid || ''}
                            onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) })}
                            className="w-full pl-9 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Fee Paid
                        </label>
                        <select
                          value={formData.clearanceFeePaid ? 'true' : 'false'}
                          onChange={(e) => setFormData({ ...formData, clearanceFeePaid: e.target.value === 'true' })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          disabled={loading}
                        >
                          <option value="false">Not Paid</option>
                          <option value="true">Paid</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Remarks Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Remarks
                      </label>
                      <textarea
                        value={formData.remarks || ''}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Additional notes or remarks..."
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({});
                    setFormErrors({});
                  }}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget.closest('div')?.previousElementSibling?.querySelector('form');
                    if (form) form.requestSubmit();
                  }}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>{modalMode === 'create' ? 'Create Request' : 'Update Request'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && modalMode === 'delete' && selectedClearance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Clearance Request
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedClearance(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete the clearance request for <strong className="text-gray-900 dark:text-white">{selectedClearance.residentName}</strong>? This action cannot be undone.
              </p>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedClearance(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch(`/api/clearances/${selectedClearance?.id}`, {
                        method: 'DELETE',
                      });

                      if (response.ok) {
                        setNotification({ type: 'success', message: 'Clearance request deleted successfully!' });
                        setShowModal(false);
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
                    setTimeout(() => setNotification(null), 3000);
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCertificate && selectedClearance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Barangay Clearance Certificate</h2>
              <button
                onClick={() => setShowCertificate(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              <div className="border-4 border-blue-600 p-8 rounded-lg">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Republic of the Philippines</h3>
                  <p className="text-lg text-gray-700">Province of [Province Name]</p>
                  <p className="text-lg text-gray-700">Municipality of [Municipality]</p>
                  <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-4">BARANGAY [NAME]</h2>
                </div>

                <div className="border-t-2 border-b-2 border-gray-300 dark:border-gray-600 py-4 mb-6">
                  <h4 className="text-center text-2xl font-bold text-gray-900">BARANGAY CLEARANCE</h4>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">TO WHOM IT MAY CONCERN:</p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed indent-8">
                    This is to certify that <span className="font-bold underline">{selectedClearance.residentName}</span>,
                    of legal age, Filipino, and a bonafide resident of this Barangay, is known to me to be of good moral
                    character and has no derogatory record filed in this office.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed indent-8">
                    This certification is being issued upon the request of the above-mentioned individual for
                    <span className="font-bold"> {selectedClearance.purposeOfClearance?.toLowerCase()}</span> purposes.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed indent-8">
                    Issued this <span className="font-bold">15th day of March, 2025</span> at Barangay [Name],
                    [Municipality], [Province], Philippines.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-12">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Verified by:</p>
                    <div className="border-b-2 border-gray-900 mb-1 h-12"></div>
                    <p className="font-bold text-center">BARANGAY SECRETARY</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Approved by:</p>
                    <div className="border-b-2 border-gray-900 mb-1 h-12"></div>
                    <p className="font-bold text-center">PUNONG BARANGAY</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600 text-center">
                  <p className="text-xs text-gray-500">Certificate No: BC-2025-{selectedClearance.id.toString().padStart(4, '0')}</p>
                  <p className="text-xs text-gray-500">OR No: _____________ | Amount Paid: ₱___________</p>
                  <div className="mt-4 flex items-center justify-center space-x-2">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center space-x-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
                  <Printer className="w-5 h-5" />
                  <span>Print Certificate</span>
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-700/50 transition-colors">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
