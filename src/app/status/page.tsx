'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Server,
  Database,
  Shield,
  Globe,
  RefreshCw,
  Clock,
  Activity,
  Wifi,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'checking';
  latency?: number;
  lastChecked?: string;
}

interface SystemStatus {
  overall: 'operational' | 'degraded' | 'down' | 'checking';
  services: ServiceStatus[];
  lastUpdated: string;
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus>({
    overall: 'checking',
    services: [
      { name: 'Web Application', status: 'checking' },
      { name: 'Database', status: 'checking' },
      { name: 'Authentication', status: 'checking' },
      { name: 'File Storage', status: 'checking' },
    ],
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    const services: ServiceStatus[] = [];
    
    // Check Web Application
    const webStart = Date.now();
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const webLatency = Date.now() - webStart;
      services.push({
        name: 'Web Application',
        status: res.ok ? 'operational' : 'degraded',
        latency: webLatency,
        lastChecked: new Date().toISOString(),
      });
    } catch {
      services.push({
        name: 'Web Application',
        status: 'down',
        lastChecked: new Date().toISOString(),
      });
    }

    // Check Database
    const dbStart = Date.now();
    try {
      const res = await fetch('/api/health/database', { cache: 'no-store' });
      const dbLatency = Date.now() - dbStart;
      services.push({
        name: 'Database',
        status: res.ok ? 'operational' : 'degraded',
        latency: dbLatency,
        lastChecked: new Date().toISOString(),
      });
    } catch {
      services.push({
        name: 'Database',
        status: 'down',
        lastChecked: new Date().toISOString(),
      });
    }

    // Check Authentication
    const authStart = Date.now();
    try {
      const res = await fetch('/api/health/auth', { cache: 'no-store' });
      const authLatency = Date.now() - authStart;
      services.push({
        name: 'Authentication',
        status: res.ok ? 'operational' : 'degraded',
        latency: authLatency,
        lastChecked: new Date().toISOString(),
      });
    } catch {
      services.push({
        name: 'Authentication',
        status: 'down',
        lastChecked: new Date().toISOString(),
      });
    }

    // Check File Storage
    const storageStart = Date.now();
    try {
      const res = await fetch('/api/health/storage', { cache: 'no-store' });
      const storageLatency = Date.now() - storageStart;
      services.push({
        name: 'File Storage',
        status: res.ok ? 'operational' : 'degraded',
        latency: storageLatency,
        lastChecked: new Date().toISOString(),
      });
    } catch {
      services.push({
        name: 'File Storage',
        status: 'down',
        lastChecked: new Date().toISOString(),
      });
    }

    // Determine overall status
    const hasDown = services.some(s => s.status === 'down');
    const hasDegraded = services.some(s => s.status === 'degraded');
    const overall = hasDown ? 'down' : hasDegraded ? 'degraded' : 'operational';

    setStatus({
      overall,
      services,
      lastUpdated: new Date().toISOString(),
    });
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
    
    // Auto-refresh every 30 seconds
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(checkStatus, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'down':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Web Application':
        return <Globe className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'Authentication':
        return <Shield className="w-5 h-5" />;
      case 'File Storage':
        return <Server className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getOverallMessage = () => {
    switch (status.overall) {
      case 'operational':
        return 'All systems operational';
      case 'degraded':
        return 'Some systems experiencing issues';
      case 'down':
        return 'System outage detected';
      default:
        return 'Checking system status...';
    }
  };

  const getOverallBgColor = () => {
    switch (status.overall) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to BRMS</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Auto-refresh
              </label>
              <button
                onClick={checkStatus}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overall Status Banner */}
      <div className={`${getOverallBgColor()} text-white py-8`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {status.overall === 'checking' ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : status.overall === 'operational' ? (
              <CheckCircle className="w-8 h-8" />
            ) : status.overall === 'degraded' ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <XCircle className="w-8 h-8" />
            )}
            <h1 className="text-2xl font-bold">{getOverallMessage()}</h1>
          </div>
          <p className="text-white/80 text-sm">
            Last updated: {new Date(status.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Services Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Service Status
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {status.services.map((service) => (
              <div key={service.name} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                    {getServiceIcon(service.name)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{service.name}</h3>
                    {service.latency && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Response time: {service.latency}ms
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                  {getStatusIcon(service.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Information */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              System Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Platform</p>
                <p className="font-medium text-gray-900 dark:text-white">Netlify</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Database</p>
                <p className="font-medium text-gray-900 dark:text-white">Supabase PostgreSQL</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Authentication</p>
                <p className="font-medium text-gray-900 dark:text-white">Auth0</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Wifi className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Region</p>
                <p className="font-medium text-gray-900 dark:text-white">Global CDN</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Having issues? Contact support or check our{' '}
            <a href="#" className="text-blue-600 hover:underline">documentation</a>.
          </p>
          <p className="mt-2">
            BRMS - Barangay Records Management System
          </p>
        </div>
      </main>
    </div>
  );
}
