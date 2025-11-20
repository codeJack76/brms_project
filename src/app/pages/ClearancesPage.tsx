import { useState, useEffect } from 'react';
import { Search, Plus, FileText, Clock, CheckCircle, XCircle, Printer, Eye, Edit, Trash2, X, AlertCircle, Calendar, DollarSign } from 'lucide-react';

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
  clearanceType: 'Barangay Clearance' | 'Certificate of Residency' | 'Indigency Certificate' | 'Business Clearance' | 'Good Moral Certificate' | 'Permit for Events/Construction';
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

// Clearance types configuration
const CLEARANCE_TYPES = [
  { 
    value: 'Barangay Clearance', 
    label: 'Barangay Clearance',
    description: 'General purpose clearance',
    fee: 50,
    icon: FileText
  },
  { 
    value: 'Certificate of Residency', 
    label: 'Certificate of Residency',
    description: 'Proof of residency',
    fee: 30,
    icon: FileText
  },
  { 
    value: 'Indigency Certificate', 
    label: 'Indigency Certificate',
    description: 'For low-income residents',
    fee: 20,
    icon: FileText
  },
  { 
    value: 'Business Clearance', 
    label: 'Business Clearance',
    description: 'For businesses operating in barangay',
    fee: 200,
    icon: FileText
  },
  { 
    value: 'Good Moral Certificate', 
    label: 'Good Moral / Good Standing Certificate',
    description: 'Certificate of good moral character',
    fee: 40,
    icon: FileText
  },
  { 
    value: 'Permit for Events/Construction', 
    label: 'Permit for Events or Construction',
    description: 'Required for events or construction',
    fee: 150,
    icon: FileText
  },
] as const;

interface Statistics {
  totalClearances: number;
  totalPending: number;
  totalIssued: number;
  totalRevenue: number;
  totalApproved: number;
  totalRejected: number;
  totalReleased: number;
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
    totalIssued: 0,
    totalRevenue: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalReleased: 0,
  });
  const [purposeBreakdown, setPurposeBreakdown] = useState<PurposeBreakdown[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clearanceTypeFilter, setClearanceTypeFilter] = useState('all');
  const [clearanceStatusFilter, setClearanceStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
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
        setPurposeBreakdown(data.purposeBreakdown || []);
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

  // Mock data for clearances (fallback)
  const mockClearances: Clearance[] = [
    {
      id: '1',
      documentNumber: 'BC-2024-001',
      residentName: 'Juan Dela Cruz',
      purpose: 'Employment',
      issueDate: '2024-01-15',
      status: 'Released',
      requestedDate: '2024-01-14',
      feeAmount: 50,
      paymentStatus: 'Paid',
      clearanceType: 'Barangay Clearance',
      hasPendingCase: false,
      clearanceStatus: 'Active',
      processedBy: 'Admin User',
      requestDate: '2024-01-14',
    },
    {
      id: '2',
      documentNumber: 'CR-2024-002',
      residentName: 'Maria Garcia',
      purpose: 'Bank Requirements',
      issueDate: '2024-01-16',
      status: 'Approved',
      requestedDate: '2024-01-15',
      feeAmount: 30,
      paymentStatus: 'Paid',
      clearanceType: 'Certificate of Residency',
      hasPendingCase: false,
      clearanceStatus: 'Processing',
      processedBy: 'Officer 1',
      requestDate: '2024-01-15',
    },
    {
      id: '3',
      documentNumber: 'BUS-2024-003',
      residentName: 'Pedro Santos',
      purpose: 'Sari-Sari Store',
      issueDate: '2024-01-18',
      status: 'Pending',
      requestedDate: '2024-01-17',
      feeAmount: 200,
      paymentStatus: 'Pending',
      clearanceType: 'Business Clearance',
      hasPendingCase: false,
      clearanceStatus: 'Pending',
      processedBy: 'Not Assigned',
      requestDate: '2024-01-17',
    },
    {
      id: '4',
      documentNumber: 'IND-2024-004',
      residentName: 'Ana Lopez',
      purpose: 'Medical Assistance',
      issueDate: '2024-01-20',
      status: 'Released',
      requestedDate: '2024-01-19',
      feeAmount: 20,
      paymentStatus: 'Paid',
      clearanceType: 'Indigency Certificate',
      hasPendingCase: false,
      clearanceStatus: 'Active',
      processedBy: 'Admin User',
      requestDate: '2024-01-19',
    },
    {
      id: '5',
      documentNumber: 'GM-2024-005',
      residentName: 'Carlos Mendoza',
      purpose: 'Employment',
      issueDate: '2024-01-21',
      status: 'Released',
      requestedDate: '2024-01-20',
      feeAmount: 40,
      paymentStatus: 'Paid',
      clearanceType: 'Good Moral Certificate',
      hasPendingCase: false,
      clearanceStatus: 'Active',
      processedBy: 'Admin User',
      requestDate: '2024-01-20',
    },
    {
      id: '6',
      documentNumber: 'PER-2024-006',
      residentName: 'Rosa Torres',
      purpose: 'Birthday Party',
      issueDate: '2024-01-22',
      status: 'Approved',
      requestedDate: '2024-01-21',
      feeAmount: 150,
      paymentStatus: 'Paid',
      clearanceType: 'Permit for Events/Construction',
      hasPendingCase: false,
      clearanceStatus: 'Processing',
      processedBy: 'Officer 2',
      requestDate: '2024-01-21',
    },
  ];

  // Use real clearances if available, fallback to mock data
  const dataSource = clearances.length > 0 ? clearances : mockClearances;

  const filteredClearances = dataSource.filter((clearance: Clearance) => {
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Clearance Management</h1>
        <p className="text-gray-600">Process and track barangay clearance requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-white">{statistics.totalClearances}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
              <p className="text-3xl font-bold text-orange-600">{statistics.totalPending}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{statistics.totalApproved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Released</p>
              <p className="text-3xl font-bold text-blue-600">{statistics.totalReleased}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button 
              onClick={() => {
                setModalMode('create');
                setFormData({
                  clearanceType: 'Barangay Clearance',
                  status: 'Pending',
                  paymentStatus: 'Unpaid',
                  feeAmount: 50,
                  hasPendingCase: false,
                  clearanceStatus: 'Pending',
                });
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
              {['All', 'Pending', 'Approved', 'Released', 'Rejected'].map((status) => (
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resident Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clearance Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
              {paginatedClearances.map((clearance) => (
                <tr key={clearance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {clearance.documentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{clearance.residentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                      {clearance.clearanceType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{clearance.purpose}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    ₱{clearance.feeAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(clearance.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(clearance.status)}`}>
                        {clearance.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{clearance.requestDate}</td>
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

      {/* Create/Edit Modal */}
      {showModal && (modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {modalMode === 'create' ? 'New Clearance Request' : 'Edit Clearance'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({});
                  setFormErrors({});
                }}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const errors: Record<string, string> = {};
                
                if (!formData.residentName && !formData.residentId) errors.residentName = 'Resident name or ID is required';
                if (!formData.clearanceType) errors.clearanceType = 'Clearance type is required';
                if (!formData.purpose) errors.purpose = 'Purpose is required';
                if (!formData.feeAmount) errors.feeAmount = 'Fee amount is required';
                
                if (Object.keys(errors).length > 0) {
                  setFormErrors(errors);
                  return;
                }
                
                setLoading(true);
                try {
                  // Map form data to API format
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
                      message: modalMode === 'create' 
                        ? 'Clearance request created successfully!' 
                        : 'Clearance updated successfully!' 
                    });
                    setShowModal(false);
                    setFormData({});
                    setFormErrors({});
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resident Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resident Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.residentName || ''}
                      onChange={(e) => setFormData({ ...formData, residentName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter resident name"
                    />
                    {formErrors.residentName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.residentName}</p>
                    )}
                  </div>

                  {/* Clearance Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Clearance Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.clearanceType || ''}
                      onChange={(e) => {
                        const selectedType = CLEARANCE_TYPES.find(t => t.value === e.target.value);
                        setFormData({ 
                          ...formData, 
                          clearanceType: e.target.value as any,
                          feeAmount: selectedType?.fee || 0
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CLEARANCE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} - ₱{type.fee}
                        </option>
                      ))}
                    </select>
                    {formErrors.clearanceType && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.clearanceType}</p>
                    )}
                  </div>

                  {/* Purpose */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Purpose <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.purpose || ''}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Employment, Business Permit, Medical Assistance"
                    />
                    {formErrors.purpose && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.purpose}</p>
                    )}
                  </div>

                  {/* Fee Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fee Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                      <input
                        type="number"
                        value={formData.feeAmount || ''}
                        onChange={(e) => setFormData({ ...formData, feeAmount: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {formErrors.feeAmount && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.feeAmount}</p>
                    )}
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={formData.paymentStatus || 'Unpaid'}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status || 'Pending'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Released">Released</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* OR Number (if paid) */}
                  {formData.paymentStatus === 'Paid' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OR Number
                      </label>
                      <input
                        type="text"
                        value={formData.orNumber || ''}
                        onChange={(e) => setFormData({ ...formData, orNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Official Receipt Number"
                      />
                    </div>
                  )}

                  {/* Pending Case */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.hasPendingCase || false}
                        onChange={(e) => setFormData({ ...formData, hasPendingCase: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Has pending case or derogatory record
                      </span>
                    </label>
                  </div>

                  {/* Case Details (if has pending case) */}
                  {formData.hasPendingCase && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Case Details
                      </label>
                      <textarea
                        value={formData.caseDetails || ''}
                        onChange={(e) => setFormData({ ...formData, caseDetails: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the case details..."
                      />
                    </div>
                  )}

                  {/* Remarks */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Remarks
                    </label>
                    <textarea
                      value={formData.remarks || ''}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes or remarks..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({});
                      setFormErrors({});
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : modalMode === 'create' ? 'Create Request' : 'Update Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && modalMode === 'delete' && selectedClearance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Delete Clearance Request?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete the clearance request for <strong>{selectedClearance.residentName}</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedClearance(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            notification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
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
                    <span className="font-bold"> {selectedClearance.purpose.toLowerCase()}</span> purposes.
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
