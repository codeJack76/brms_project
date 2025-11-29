'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { PageId } from '@/lib/rbac';

interface DashboardData {
  user: {
    name: string;
    role: string;
  };
  stats: {
    residents: {
      total: number;
      growth: number;
      thisMonth: number;
    };
    clearances: {
      total: number;
      pending: number;
      approved: number;
      released: number;
      growth: number;
      thisMonth: number;
    };
    documents: {
      total: number;
      growth: number;
      thisMonth: number;
    };
    blotters: {
      total: number;
      active: number;
      change: number;
      thisMonth: number;
    };
    financial: {
      totalIncome: number;
      totalExpenses: number;
      netIncome: number;
      thisMonthIncome: number;
      thisMonthExpenses: number;
    };
  };
  demographics: {
    male: number;
    female: number;
    malePercent: number;
    femalePercent: number;
    ageDistribution: {
      minors: number;
      adults: number;
      seniors: number;
    };
  };

}

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format numbers with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};





interface DashboardProps {
  onNavigate?: (page: PageId) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchDashboardData(true), 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, demographics } = data;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back{data.user.name ? `, ${data.user.name}` : ''}! Here&apos;s what&apos;s happening in your barangay.
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Residents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            {stats.residents.growth !== 0 && (
              <span
                className={`text-sm font-medium flex items-center ${
                  stats.residents.growth > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {stats.residents.growth > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(stats.residents.growth)}%
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(stats.residents.total)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Residents</p>
        </div>

        {/* Clearance Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            {stats.clearances.pending > 0 && (
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {stats.clearances.pending} pending
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(stats.clearances.total)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Clearance Requests</p>
        </div>

        {/* Documents Stored */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            {stats.documents.growth !== 0 && (
              <span
                className={`text-sm font-medium flex items-center ${
                  stats.documents.growth > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {stats.documents.growth > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(stats.documents.growth)}%
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(stats.documents.total)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Documents Stored</p>
        </div>

        {/* Active Blotters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            {stats.blotters.change !== 0 && (
              <span
                className={`text-sm font-medium flex items-center ${
                  stats.blotters.change < 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {stats.blotters.change < 0 ? (
                  <TrendingDown className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-1" />
                )}
                {Math.abs(stats.blotters.change)}%
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(stats.blotters.active)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Blotters</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          onClick={() => onNavigate?.('residents')}
          className="w-full text-left px-4 py-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center space-x-3 border border-blue-200 dark:border-blue-800"
        >
          <Users className="w-6 h-6" />
          <span className="font-medium">Add New Resident</span>
        </button>
        <button
          onClick={() => onNavigate?.('clearances')}
          className="w-full text-left px-4 py-4 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors flex items-center space-x-3 border border-teal-200 dark:border-teal-800"
        >
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">Issue Clearance</span>
        </button>
        <button
          onClick={() => onNavigate?.('documents')}
          className="w-full text-left px-4 py-4 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors flex items-center space-x-3 border border-orange-200 dark:border-orange-800"
        >
          <FileText className="w-6 h-6" />
          <span className="font-medium">Upload Document</span>
        </button>
        <button
          onClick={() => onNavigate?.('blotter')}
          className="w-full text-left px-4 py-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center space-x-3 border border-red-200 dark:border-red-800"
        >
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">Record Blotter</span>
        </button>
      </div>

      {/* Bottom Grid - Demographics, Pending, Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Population Demographics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Population Demographics
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Male</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {demographics.malePercent}% ({formatNumber(demographics.male)})
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${demographics.malePercent}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Female</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {demographics.femalePercent}% ({formatNumber(demographics.female)})
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-pink-500 dark:bg-pink-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${demographics.femalePercent}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Age Distribution
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(demographics.ageDistribution.minors)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">0-17 years</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(demographics.ageDistribution.adults)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">18-59 years</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(demographics.ageDistribution.seniors)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">60+ years</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clearances Issued</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.clearances.thisMonth}
                </p>
              </div>
              <div className="text-right">
                {stats.clearances.growth !== 0 && (
                  <>
                    <span
                      className={`text-sm font-medium flex items-center justify-end ${
                        stats.clearances.growth > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {stats.clearances.growth > 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(stats.clearances.growth)}%
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Residents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.residents.thisMonth}
                </p>
              </div>
              <div className="text-right">
                {stats.residents.growth !== 0 && (
                  <>
                    <span
                      className={`text-sm font-medium flex items-center justify-end ${
                        stats.residents.growth > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {stats.residents.growth > 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(stats.residents.growth)}%
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Blotter Cases</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.blotters.thisMonth}
                </p>
              </div>
              <div className="text-right">
                {stats.blotters.change !== 0 && (
                  <>
                    <span
                      className={`text-sm font-medium flex items-center justify-end ${
                        stats.blotters.change < 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {stats.blotters.change < 0 ? (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(stats.blotters.change)}%
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</p>
                  </>
                )}
              </div>
            </div>
            {/* Financial Summary */}
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.financial.thisMonthIncome)}
                </p>
              </div>
              <div className="text-right">
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending Approvals
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Pending Clearances</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Awaiting approval</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.clearances.pending}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Ready to Release</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Approved clearances</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.clearances.approved}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Active Blotters</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Ongoing cases</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.blotters.active}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Total Released</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Completed clearances</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.clearances.released}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
