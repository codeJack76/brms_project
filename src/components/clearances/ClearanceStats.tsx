import { Clock, CheckCircle, XCircle, DollarSign, FileText } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Clearances */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Clearances</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.totalClearances}</p>
          </div>
          <FileText className="w-10 h-10 text-blue-600" />
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
            <p className="text-3xl font-bold text-orange-600">{statistics.totalPending}</p>
          </div>
          <Clock className="w-10 h-10 text-orange-600" />
        </div>
      </div>

      {/* Released */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Released</p>
            <p className="text-3xl font-bold text-blue-600">{statistics.totalReleased}</p>
          </div>
          <CheckCircle className="w-10 h-10 text-blue-600" />
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">₱{statistics.totalRevenue.toFixed(2)}</p>
          </div>
          <DollarSign className="w-10 h-10 text-green-600" />
        </div>
      </div>
    </div>
  );
}
