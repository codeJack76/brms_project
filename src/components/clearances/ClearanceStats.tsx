import { Clock, CheckCircle, FileText, DollarSign } from 'lucide-react';

interface Statistics {
  totalClearances: number;
  totalPending: number;
  totalIssued: number;
  totalRevenue: number;
  totalApproved: number;
  totalRejected: number;
  totalReleased: number;
}

interface ClearanceStatsProps {
  statistics: Statistics;
}

export default function ClearanceStats({ statistics }: ClearanceStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Clearances - Gradient Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100 mb-1">Total Clearances</p>
            <p className="text-3xl font-bold">{statistics.totalClearances}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
            <p className="text-3xl font-bold text-orange-600">{statistics.totalPending}</p>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Released */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Released</p>
            <p className="text-3xl font-bold text-green-600">{statistics.totalReleased}</p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-purple-600">₱{statistics.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
