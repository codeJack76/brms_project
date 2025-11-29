import { Eye, Edit, Printer, Trash2, Clock, CheckCircle, XCircle, ArrowUpDown } from 'lucide-react';

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

export type SortField = 'documentNumber' | 'residentName' | 'clearanceType' | 'feeAmount' | 'status';
export type SortDirection = 'asc' | 'desc';

interface ClearanceTableProps {
  clearances: Clearance[];
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
  onView: (clearance: Clearance) => void;
  onEdit: (clearance: Clearance) => void;
  onDelete: (clearance: Clearance) => void;
  onPrint: (clearance: Clearance) => void;
}

export default function ClearanceTable({
  clearances,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  onPrint
}: ClearanceTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Released':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Released':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      onClick={() => onSort?.(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {onSort && (
          <>
            <ArrowUpDown className={`w-4 h-4 ${sortField === field ? 'text-blue-600' : 'text-gray-400'}`} />
            {sortField === field && (
              <span className="text-xs text-blue-600">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </>
        )}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <SortableHeader field="documentNumber">Clearance No.</SortableHeader>
            <SortableHeader field="residentName">Resident Name</SortableHeader>
            <SortableHeader field="clearanceType">Clearance Type</SortableHeader>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Purpose
            </th>
            <SortableHeader field="feeAmount">Fee</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {clearances.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                No clearances found
              </td>
            </tr>
          ) : (
            clearances.map((clearance) => (
              <tr key={clearance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {clearance.documentNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {clearance.residentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {clearance.clearanceType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {clearance.purpose}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  ₱{clearance.feeAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(clearance.status)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(clearance.status)}`}>
                      {clearance.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(clearance)}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(clearance)}
                      className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {clearance.status === 'Released' && (
                      <button 
                        onClick={() => onPrint(clearance)}
                        className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded" 
                        title="Print"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(clearance)}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
