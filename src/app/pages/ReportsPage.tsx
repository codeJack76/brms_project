'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Users,
  FileCheck,
  DollarSign,
  Calendar,
  Filter,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  X,
  Printer,
} from 'lucide-react';

interface ReportCounts {
  residents: { total: number; thisMonth: number };
  clearances: { total: number; thisMonth: number };
  blotter: { total: number; thisMonth: number };
  financial: { total: number; thisMonth: number };
}

interface GeneratedReport {
  title: string;
  barangay: string;
  period: string;
  generatedAt: string;
  generatedBy: string;
  columns: string[];
  data: Record<string, string>[];
  totalRecords: number;
}

// Demo data for reports
const demoCounts: ReportCounts = {
  residents: { total: 1247, thisMonth: 12 },
  clearances: { total: 156, thisMonth: 23 },
  blotter: { total: 23, thisMonth: 3 },
  financial: { total: 89, thisMonth: 15 },
};

interface ReportsPageProps {
  isDemoMode?: boolean;
}

export default function ReportsPage({ isDemoMode = false }: ReportsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('residents');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [counts, setCounts] = useState<ReportCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Set demo data when isDemoMode changes
  useEffect(() => {
    if (isDemoMode) {
      setCounts(demoCounts);
      setLoading(false);
    }
  }, [isDemoMode]);

  // Fetch report counts
  const fetchCounts = useCallback(async () => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to fetch report data');
      const data = await response.json();
      setCounts(data.counts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Generate report
  const handleGenerateReport = async (reportType?: string) => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: reportType || selectedReport,
          period: selectedPeriod,
          startDate: selectedPeriod === 'custom' ? customStartDate : undefined,
          endDate: selectedPeriod === 'custom' ? customEndDate : undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate report');
      }

      const data = await response.json();
      setGeneratedReport(data.report);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // Download as CSV
  const downloadCSV = () => {
    if (!generatedReport) return;

    const headers = generatedReport.columns.join(',');
    const rows = generatedReport.data.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${generatedReport.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  const reports = [
    {
      id: 'residents',
      name: 'Residents Report',
      icon: Users,
      count: counts?.residents.total || 0,
      description: 'Complete list of all registered residents',
      color: 'blue',
    },
    {
      id: 'clearances',
      name: 'Clearances Report',
      icon: FileCheck,
      count: counts?.clearances.total || 0,
      description: 'Issued clearances and pending requests',
      color: 'teal',
    },
    {
      id: 'blotter',
      name: 'Blotter Report',
      icon: AlertCircle,
      count: counts?.blotter.total || 0,
      description: 'Incident reports and blotter records',
      color: 'red',
    },
    {
      id: 'financial',
      name: 'Financial Report',
      icon: DollarSign,
      count: counts?.financial.total || 0,
      description: 'Revenue and financial transactions',
      color: 'green',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'bg-blue-600',
      },
      teal: {
        bg: 'bg-teal-100 dark:bg-teal-900/30',
        text: 'text-teal-600 dark:text-teal-400',
        icon: 'bg-teal-600',
      },
      red: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-600 dark:text-red-400',
        icon: 'bg-red-600',
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-600 dark:text-green-400',
        icon: 'bg-green-600',
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
        icon: 'bg-orange-600',
      },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and download system reports
          </p>
        </div>
        <button
          onClick={fetchCounts}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Report Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Report Type
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="residents">Residents</option>
                <option value="clearances">Clearances</option>
                <option value="blotter">Blotter</option>
                <option value="financial">Financial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="daily">Today</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">This Month</option>
                <option value="quarterly">This Quarter</option>
                <option value="yearly">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => handleGenerateReport()}
                disabled={generating}
                className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Custom Date Range */}
          {selectedPeriod === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Generate
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Click on any report to generate it with current period settings
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => {
              const Icon = report.icon;
              const colors = getColorClasses(report.color);
              return (
                <div
                  key={report.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${colors.bg} rounded-xl`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {report.count.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {report.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={generating}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {showPreview && generatedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {generatedReport.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {generatedReport.barangay} • {generatedReport.period} •{' '}
                  {generatedReport.totalRecords} records
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Report Content */}
            <div className="flex-1 overflow-auto p-6" id="report-content">
              {generatedReport.data.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No records found for the selected period
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        {generatedReport.columns.map((col, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {generatedReport.data.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          {Object.values(row).map((val, colIdx) => (
                            <td
                              key={colIdx}
                              className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
