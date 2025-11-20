import { Users, FileText, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening in your barangay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">2,847</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Residents</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">24 pending</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">156</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Clearance Requests</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              8%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">1,234</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Documents Stored</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center">
              <TrendingDown className="w-4 h-4 mr-1" />
              3%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">12</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Blotters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {[
              { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', action: 'Clearance approved', name: 'Juan Dela Cruz', time: '5 minutes ago' },
              { icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', action: 'New resident registered', name: 'Maria Santos', time: '1 hour ago' },
              { icon: FileText, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30', action: 'Document uploaded', name: 'Barangay Resolution 2025-01', time: '2 hours ago' },
              { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', action: 'Blotter recorded', name: 'Noise complaint case', time: '3 hours ago' },
              { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', action: 'Clearance issued', name: 'Pedro Rodriguez', time: '5 hours ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div className={`p-2 ${activity.bg} rounded-lg flex-shrink-0`}>
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{activity.name}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center space-x-3">
              <Users className="w-5 h-5" />
              <span className="font-medium">Add New Resident</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Issue Clearance</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors flex items-center space-x-3">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Upload Document</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center space-x-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Record Blotter</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Pending Approvals</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Clearances</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">24</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Documents</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">8</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Blotter Cases</span>
                <span className="font-semibold text-red-600 dark:text-red-400">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Population Demographics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Male</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">52% (1,480)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: '52%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Female</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">48% (1,367)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-pink-500 dark:bg-pink-400 h-2 rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Age Distribution</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">847</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">0-17 years</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1,623</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">18-59 years</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">377</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">60+ years</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clearances Issued</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  23%
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Residents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">34</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  12%
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Blotter Cases</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">7</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  45%
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
