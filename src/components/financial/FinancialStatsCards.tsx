'use client';

import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Statistics } from './types';
import { formatCurrency } from './utils';

interface FinancialStatsCardsProps {
  statistics: Statistics | null;
}

export default function FinancialStatsCards({ statistics }: FinancialStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Income - Gradient Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-100 mb-1">Total Income</p>
            <p className="text-3xl font-bold">{formatCurrency(statistics?.totalIncome || 0)}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
        {statistics && (
          <p className="text-sm mt-2 text-green-100">
            {statistics.incomeChange >= 0 ? '+' : ''}{statistics.incomeChange}% from last month
          </p>
        )}
      </div>

      {/* Total Expenses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(statistics?.totalExpenses || 0)}</p>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>
        {statistics && (
          <p className={`text-sm mt-2 ${statistics.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {statistics.expenseChange >= 0 ? '+' : ''}{statistics.expenseChange}% from last month
          </p>
        )}
      </div>

      {/* Net Income */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Income</p>
            <p className={`text-3xl font-bold ${(statistics?.netIncome || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(statistics?.netIncome || 0)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        {statistics && (
          <p className={`text-sm mt-2 ${statistics.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {statistics.netChange >= 0 ? '+' : ''}{statistics.netChange}% from last month
          </p>
        )}
      </div>

      {/* This Month */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(statistics?.thisMonthNet || 0)}</p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
          {statistics?.pendingCount || 0} pending transactions
        </p>
      </div>
    </div>
  );
}
