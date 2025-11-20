import { Eye, Edit, Printer, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

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

interface ClearanceTableProps {
  clearances: Clearance[];
  onView: (clearance: Clearance) => void;
  onEdit: (clearance: Clearance) => void;
  onDelete: (clearance: Clearance) => void;
  onPrint: (clearance: Clearance) => void;
}

export default function ClearanceTable({
  clearances,
  onView,
  onEdit,
  onDelete,
  onPrint
}: ClearanceTableProps) {
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
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'Released':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (clearances.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No clearances found. Create your first clearance request.</p>
      </div>
    );
  }

  return (
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
          {clearances.map((clearance) => (
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
                    onClick={() => onView(clearance)}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    title="View Certificate"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(clearance)}
                    className="p-1 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {clearance.status === 'Released' && (
                    <button 
                      onClick={() => onPrint(clearance)}
                      className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:bg-green-900/30 rounded" 
                      title="Print"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(clearance)}
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
  );
}
