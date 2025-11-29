import { Search, Plus } from 'lucide-react';

interface ResidentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterGender: string;
  onFilterGenderChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  onAddNew: () => void;
}

export default function ResidentFilters({
  searchTerm,
  onSearchChange,
  filterGender,
  onFilterGenderChange,
  filterStatus,
  onFilterStatusChange,
  onAddNew,
}: ResidentFiltersProps) {
  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or purpose..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button 
          onClick={onAddNew}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Resident</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          {['All', 'Active', 'Inactive'].map((status) => (
            <button
              key={status}
              onClick={() => onFilterStatusChange(status === 'All' ? '' : status)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                (status === 'All' && filterStatus === '') || filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender:</span>
          <select
            value={filterGender}
            onChange={(e) => onFilterGenderChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}
