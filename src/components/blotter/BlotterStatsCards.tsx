import { FileText, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { BlotterStatistics } from './types';

interface BlotterStatsCardsProps {
  stats: BlotterStatistics;
}

export default function BlotterStatsCards({ stats }: BlotterStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm">Total Cases</span>
          <FileText className="w-5 h-5 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCases}</span>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm">Pending</span>
          <Clock className="w-5 h-5 text-yellow-500" />
        </div>
        <span className="text-2xl font-bold text-yellow-600">{stats.pending}</span>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm">Investigating</span>
          <AlertCircle className="w-5 h-5 text-orange-500" />
        </div>
        <span className="text-2xl font-bold text-orange-600">{stats.investigating}</span>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm">Resolved</span>
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
        <span className="text-2xl font-bold text-green-600">{stats.resolved}</span>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm">Dismissed</span>
          <XCircle className="w-5 h-5 text-gray-500" />
        </div>
        <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.dismissed}</span>
      </div>
    </div>
  );
}
