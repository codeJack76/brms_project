"use client";

import { useState, useEffect } from "react";
import { User, ChevronDown, LogOut, Home, Play, AlertTriangle } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { hasPageAccess, getAccessiblePages, getDefaultPage, PageId } from '@/lib/rbac';

// Page imports
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ResidentsPage from './pages/ResidentsPage';
import DocumentsPage from './pages/DocumentsPage';
import ClearancesPage from './pages/ClearancesPage';
import BlotterPage from './pages/BlotterPage';
import FinancialPage from './pages/FinancialPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import SuperadminPage from './pages/SuperadminPage';

export default function App() {
  const { theme } = useTheme();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsBarangaySetup, setNeedsBarangaySetup] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // User data state
  const [userEmail, setUserEmail] = useState('demo@barangay.local');
  const [userName, setUserName] = useState('Demo Admin');
  const [userRole, setUserRole] = useState('superadmin');

  // Get accessible pages for current user role
  const accessiblePages = getAccessiblePages(userRole);
  
  // Check if user has access to current page
  useEffect(() => {
    if (userRole && currentPage && !hasPageAccess(userRole, currentPage)) {
      // Redirect to default page if user doesn't have access
      const defaultPage = getDefaultPage(userRole);
      setCurrentPage(defaultPage);
    }
  }, [userRole, currentPage]);

  const displayName = userName;
  const displayEmail = userEmail;

  // Check for existing session on load (but don't auto-show dashboard)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setUserEmail(data.user.email);
            setUserName(data.user.name);
            setUserRole(data.user.role);
            setIsAuthenticated(true);
            
            // Check if barangay captain needs to set up barangay info
            if (data.user.role === 'barangay_captain' && data.user.barangay_id) {
              const barangayRes = await fetch(`/api/barangays?id=${data.user.barangay_id}`);
              if (barangayRes.ok) {
                const barangayData = await barangayRes.json();
                // Check if barangay needs configuration (has placeholder data)
                if (barangayData.barangay.municipality === 'To be configured') {
                  setNeedsBarangaySetup(true);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };
    
    checkSession();
  }, []);

  // Handle login from landing page
  const handleEnterSystem = async (email: string, name: string) => {
    if (isAuthenticated) {
      // Check if barangay captain needs to set up barangay first
      if (needsBarangaySetup && userRole === 'barangay_captain') {
        setCurrentPage('settings');
        setShowDashboard(true);
      } else {
        // Set to default page for user's role
        const defaultPage = getDefaultPage(userRole);
        setCurrentPage(defaultPage);
        setShowDashboard(true);
      }
    } else {
      // Redirect to Auth0 login
      window.location.href = '/api/auth/login?mode=login';
    }
  };

  // Handle exit system (go back to landing page while staying logged in)
  const handleExitSystem = () => {
    setShowDashboard(false);
    setShowUserMenu(false);
  };

  // Handle signup completion
  const handleSignupComplete = (email: string, name: string, role: string) => {
    setUserEmail(email);
    setUserName(name);
    setUserRole(role); // Role from invitation
    setShowDashboard(true);
    setShowSignup(false);
  };

  // Handle logout
  const handleLogout = async () => {
    // If in demo mode, just exit to landing
    if (isDemoMode) {
      setShowDashboard(false);
      setIsDemoMode(false);
      setUserName('Demo Admin');
      setUserEmail('demo@barangay.local');
      setUserRole('barangay_captain');
      return;
    }
    
    try {
      // Clear backend session and redirect to Auth0 logout
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Redirect to Auth0 logout which will redirect back to landing page
      window.location.href = '/api/auth/logout';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: just redirect to landing
      setShowDashboard(false);
      setIsAuthenticated(false);
      window.location.href = '/';
    }
  };

  // Handle demo mode
  const handleStartDemo = () => {
    setIsDemoMode(true);
    setUserName('Demo User');
    setUserEmail('demo@brms.example');
    setUserRole('barangay_captain');
    setCurrentPage('dashboard');
    setShowDashboard(true);
  };

  // If showing signup page
  if (showSignup && !showDashboard) {
    return (
      <SignupPage 
        onSignupComplete={handleSignupComplete}
        onBackToLogin={() => setShowSignup(false)}
      />
    );
  }

  // If not in dashboard mode, show landing page
  if (!showDashboard) {
    return (
      <LandingPage 
        onEnterSystem={handleEnterSystem}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onShowSignup={() => setShowSignup(true)}
        onStartDemo={handleStartDemo}
      />
    );
  }

  // Main application layout with sidebar
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm">
          <Play className="w-4 h-4" />
          <span><strong>Demo Mode</strong> - You're exploring BRMS with sample data. Some features are limited.</span>
          <button
            onClick={handleLogout}
            className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium transition-colors"
          >
            Exit Demo
          </button>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">BRMS</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Barangay Records</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {accessiblePages.map((page) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                currentPage === page.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              title={page.description}
            >
              {page.label}
            </button>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {userRole}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{displayEmail}</p>
                </div>

                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={handleExitSystem}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Exit System</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} isDemoMode={isDemoMode} />}
        {currentPage === 'residents' && <ResidentsPage isDemoMode={isDemoMode} />}
        {currentPage === 'documents' && <DocumentsPage isDemoMode={isDemoMode} />}
        {currentPage === 'clearances' && <ClearancesPage isDemoMode={isDemoMode} />}
        {currentPage === 'blotter' && <BlotterPage isDemoMode={isDemoMode} />}
        {currentPage === 'financial' && <FinancialPage isDemoMode={isDemoMode} />}
        {currentPage === 'reports' && <ReportsPage isDemoMode={isDemoMode} />}
        {currentPage === 'settings' && <SettingsPage userRole={userRole} isDemoMode={isDemoMode} />}
        {currentPage === 'superadmin' && <SuperadminPage />}
      </main>
      </div>
    </div>
  );
}

