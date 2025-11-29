import { Search, Plus } from 'lucide-react';
import { INCIDENT_TYPES } from './types';

interface BlotterFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  onCreateNew: () => void;
}

export default function BlotterFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  onCreateNew,
}: BlotterFiltersProps) {
  const statuses = ['All', 'Pending', 'Investigating', 'Resolved', 'Dismissed'];

  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or case number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button
          onClick={onCreateNew}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Blotter Record</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status === 'All' ? 'all' : status.toLowerCase())}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                (status === 'All' && selectedStatus === 'all') || selectedStatus === status.toLowerCase()
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
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Types</option>
            {INCIDENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
