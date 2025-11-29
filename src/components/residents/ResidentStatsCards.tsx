import { Users, User, Calendar, AlertCircle } from 'lucide-react';
import { ResidentStats } from './types';

interface ResidentStatsCardsProps {
  stats: ResidentStats;
}

export default function ResidentStatsCards({ stats }: ResidentStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Residents</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <Users className="w-10 h-10 text-blue-100" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Male</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.male}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? ((stats.male / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Female</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.female}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? ((stats.female / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
            <User className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <AlertCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Age</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgAge}</p>
            <p className="text-xs text-gray-500 mt-1">years old</p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
