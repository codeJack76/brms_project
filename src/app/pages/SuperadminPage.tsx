'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building2,
  Activity,
  UserPlus,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Loader2,
  Mail,
  Send,
  Copy,
  Globe,
  TrendingUp,
} from 'lucide-react';

interface Barangay {
  id: string;
  name: string;
  address: string;
  email: string;
  contact_number: string;
  created_at: string;
}

interface Captain {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  barangays?: Barangay;
}

interface SystemStats {
  totalBarangays: number;
  totalCaptains: number;
  totalUsers: number;
  totalResidents: number;
  activeCaptains: number;
  pendingSetup: number;
}

export default function SuperadminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'captains' | 'invite'>('overview');
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invitation state
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch captains with barangay info
      const captainsRes = await fetch('/api/users?include_barangay=true&captains_only=true');
      const captainsData = await captainsRes.json();

      if (captainsRes.ok) {
        setCaptains(captainsData.users || []);
      }

      // Fetch system stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        // Calculate basic stats from captains data
        const activeCaptains = (captainsData.users || []).filter((c: Captain) => c.is_active).length;
        const pendingSetup = (captainsData.users || []).filter((c: Captain) => !c.barangays?.name).length;
        setStats({
          totalBarangays: (captainsData.users || []).filter((c: Captain) => c.barangays?.name).length,
          totalCaptains: (captainsData.users || []).length,
          totalUsers: 0,
          totalResidents: 0,
          activeCaptains,
          pendingSetup,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Invite new captain
  const handleInvite = async () => {
    setInviteError('');
    setInviteSuccess('');
    setGeneratedCode('');

    if (!inviteEmail) {
      setInviteError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setInviteError('Invalid email format');
      return;
    }

    setIsInviting(true);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: 'barangay_captain',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setInviteError(data.error || 'Failed to create invitation');
        return;
      }

      setInviteSuccess(`Invitation created successfully!`);
      setGeneratedCode(data.invitation.code);
      setInviteEmail('');

      // Refresh captains list
      fetchData();

      setTimeout(() => {
        setInviteSuccess('');
      }, 10000);
    } catch (err) {
      setInviteError('An error occurred while creating invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Superadmin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">System-wide management and oversight</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalBarangays || 0}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Barangays</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {stats?.activeCaptains || 0} active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCaptains || 0}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Barangay Captains</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingSetup || 0}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Setup</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalResidents || 0}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Residents</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('captains')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'captains'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Barangay Captains
        </button>
        <button
          onClick={() => setActiveTab('invite')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'invite'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Invite Captain
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('invite')}
                className="w-full text-left px-4 py-3 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-3"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Add New Barangay Captain</span>
              </button>
              <button
                onClick={() => setActiveTab('captains')}
                className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-3"
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">View All Captains</span>
              </button>
              <button
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">System Settings</span>
              </button>
            </div>
          </div>

          {/* Recent Captains */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Captains</h2>
            {captains.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No barangay captains yet</p>
                <button
                  onClick={() => setActiveTab('invite')}
                  className="mt-3 text-purple-600 dark:text-purple-400 font-medium hover:underline"
                >
                  Invite your first captain
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {captains.slice(0, 5).map((captain) => (
                  <div
                    key={captain.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          {(captain.name || captain.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {captain.name || 'Unnamed'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {captain.barangays?.name || 'No barangay assigned'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        captain.barangays?.name
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      }`}
                    >
                      {captain.barangays?.name ? 'Active' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'captains' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Barangay Captains</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and monitor all barangay captains in the system
            </p>
          </div>

          {captains.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Captains Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by inviting your first barangay captain
              </p>
              <button
                onClick={() => setActiveTab('invite')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Invite Captain
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Captain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Barangay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {captains.map((captain) => (
                    <tr key={captain.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                              {(captain.name || captain.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {captain.name || 'Unnamed Captain'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{captain.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {captain.barangays?.name ? (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {captain.barangays.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {captain.barangays.address || 'No address'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-orange-600 dark:text-orange-400 text-sm">
                            Not set up yet
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {captain.barangays?.contact_number || '—'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {captain.barangays?.email || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            captain.is_active && captain.barangays?.name
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : captain.is_active
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              captain.is_active && captain.barangays?.name
                                ? 'bg-green-500'
                                : captain.is_active
                                ? 'bg-orange-500'
                                : 'bg-gray-400'
                            }`}
                          />
                          {captain.is_active && captain.barangays?.name
                            ? 'Active'
                            : captain.is_active
                            ? 'Pending Setup'
                            : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'invite' && (
        <div className="max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <UserPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Invite New Barangay Captain
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send an invitation to create a new barangay captain account
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="captain@barangay.gov.ph"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Note:</strong> The invited captain will receive a registration code. They will need to:
                </p>
                <ol className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
                  <li>Go to the signup page</li>
                  <li>Enter the invitation code</li>
                  <li>Complete their registration</li>
                  <li>Set up their barangay information</li>
                </ol>
              </div>

              <button
                onClick={handleInvite}
                disabled={isInviting}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {isInviting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>

            {/* Success */}
            {inviteSuccess && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800 dark:text-green-200">{inviteSuccess}</p>
                    {generatedCode && (
                      <>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                          Share this code with the captain:
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <code className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded text-lg font-mono text-green-700 dark:text-green-300">
                            {generatedCode}
                          </code>
                          <button
                            onClick={copyCode}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                          >
                            {copiedCode ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {inviteError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-800 dark:text-red-200">{inviteError}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
