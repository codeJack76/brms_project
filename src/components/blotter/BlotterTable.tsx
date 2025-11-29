import { Eye, Edit2, Trash2 } from 'lucide-react';
import { BlotterRecord } from './types';
import { getStatusColor, getStatusIcon } from './utils';

interface BlotterTableProps {
  records: BlotterRecord[];
  onView: (record: BlotterRecord) => void;
  onEdit: (record: BlotterRecord) => void;
  onDelete: (id: string) => void;
}

export default function BlotterTable({
  records,
  onView,
  onEdit,
  onDelete,
}: BlotterTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
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
          {records.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                No blotter records found
              </td>
            </tr>
          ) : (
            records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                  {record.location || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(record)}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(record)}
                      className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(record.id)}
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
