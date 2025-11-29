import { ArrowUpDown, Eye, Edit2, Trash2 } from 'lucide-react';
import { Resident, SortField, SortDirection } from './types';
import { calculateAge, getFullName } from './utils';

interface ResidentTableProps {
  residents: Resident[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onView: (resident: Resident) => void;
  onEdit: (resident: Resident) => void;
  onDelete: (resident: Resident) => void;
}

export default function ResidentTable({
  residents,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}: ResidentTableProps) {
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-4 h-4 ${sortField === field ? 'text-blue-600' : 'text-gray-400'}`} />
        {sortField === field && (
          <span className="text-xs text-blue-600">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  if (residents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No residents found</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <SortableHeader field="lastName">Name</SortableHeader>
            <SortableHeader field="gender">Gender</SortableHeader>
            <SortableHeader field="dateOfBirth">Age</SortableHeader>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Address</th>
            <SortableHeader field="status">Status</SortableHeader>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {residents.map((resident) => (
            <tr key={resident.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {getFullName(resident)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{resident.email || 'No email'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  resident.gender === 'Male' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                    : resident.gender === 'Female'
                    ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {resident.gender}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">{calculateAge(resident.dateOfBirth || resident.birth_date)} yrs</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(resident.dateOfBirth || resident.birth_date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600 dark:text-gray-400">{resident.phone || resident.mobile || 'No phone'}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{resident.address}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  (resident.status === 'Active' || resident.is_active)
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {resident.status || (resident.is_active ? 'Active' : 'Inactive')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(resident)}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(resident)}
                    className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(resident)}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
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
