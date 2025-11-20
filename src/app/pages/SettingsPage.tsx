'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Shield, Globe, Save, Eye, EyeOff, Users, Mail, Send, Copy, CheckCircle, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SettingsPageProps {
  userRole?: string;
}

export default function SettingsPage({ userRole = 'staff' }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('general');
  const { theme, toggleTheme } = useTheme();
  
  // Barangay settings
  const [barangayId, setBarangayId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoadingBarangay, setIsLoadingBarangay] = useState(true);
  const [isSavingBarangay, setIsSavingBarangay] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isEditingBarangay, setIsEditingBarangay] = useState(false);
  
  // Profile settings
  const [fullName, setFullName] = useState('Admin User');
  const [position, setPosition] = useState('Barangay Captain');
  const [userEmail, setUserEmail] = useState('admin@example.com');
  const [showPassword, setShowPassword] = useState(false);

  // Admin Users - Invitation Management
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    if (userRole === 'superadmin') {
      return [
        { value: 'barangay_captain', label: 'Barangay Captain' }
      ];
    } else if (userRole === 'barangay_captain') {
      return [
        { value: 'secretary', label: 'Secretary' },
        { value: 'treasurer', label: 'Treasurer' },
        { value: 'staff', label: 'Staff' },
        { value: 'peace_order_officer', label: 'Peace & Order Officer' },
        { value: 'health_officer', label: 'Health Officer' },
        { value: 'social_worker', label: 'Social Worker' }
      ];
    } else if (userRole === 'secretary') {
      return [
        { value: 'staff', label: 'Staff' }
      ];
    }
    // Default empty for other roles
    return [];
  };

  const availableRoles = getAvailableRoles();

  // Set default role when component mounts or userRole changes
  useEffect(() => {
    if (availableRoles.length > 0) {
      setInviteRole(availableRoles[0].value);
    }
  }, [userRole]);

  // Load barangay data on mount
  useEffect(() => {
    const loadBarangayData = async () => {
      try {
        setIsLoadingBarangay(true);
        
        // Get the user's session data
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        
        console.log('🔍 Session Data:', sessionData);
        console.log('🔍 Is Authenticated:', sessionData.authenticated);
        console.log('🔍 User:', sessionData.user);
        
        if (sessionData.authenticated && sessionData.user) {
          const userEmail = sessionData.user.email;
          const userBarangayId = sessionData.user?.barangay_id;
          
          console.log('📧 User Email:', userEmail);
          console.log('🏘️ User Barangay ID:', userBarangayId);
          console.log('🏘️ Barangay ID Type:', typeof userBarangayId);
          
          // Auto-populate email with user's email
          setEmail(userEmail || '');
          
          // Priority 1: If user has barangay_id, fetch by ID (most reliable)
          if (userBarangayId) {
            console.log('✅ Fetching barangay by ID:', userBarangayId);
            const res = await fetch(`/api/barangays?id=${userBarangayId}`);
            const data = await res.json();
            
            console.log('📦 Barangay API Response:', data);
            
            if (data.barangay) {
              console.log('✅ Setting barangay state with:', data.barangay);
              setBarangayId(data.barangay.id);
              setName(data.barangay.name || '');
              setAddress(data.barangay.address || '');
              setContactNumber(data.barangay.contact_number || '');
              setEmail(data.barangay.email || userEmail);
              console.log('✅ Barangay state set!');
            } else {
              console.warn('⚠️ No barangay found in API response');
            }
          } 
          // Priority 2: Fallback to email-based lookup (for backward compatibility)
          else if (userEmail) {
            console.log('📧 No barangay_id, trying email lookup:', userEmail);
            const res = await fetch(`/api/barangays?email=${encodeURIComponent(userEmail)}`);
            const data = await res.json();
            
            console.log('📦 Email lookup response:', data);
            
            if (data.barangay) {
              console.log('✅ Setting barangay from email lookup');
              setBarangayId(data.barangay.id);
              setName(data.barangay.name || '');
              setAddress(data.barangay.address || '');
              setContactNumber(data.barangay.contact_number || '');
              setEmail(data.barangay.email || userEmail);
            } else {
              console.log('❌ No barangay found by email');
            }
          } else {
            console.log('❌ No barangay_id or email available');
          }
        } else {
          console.log('❌ User not authenticated or no user data');
        }
      } catch (error) {
        console.error('Error loading barangay data:', error);
      } finally {
        setIsLoadingBarangay(false);
      }
    };

    loadBarangayData();
  }, []);

  // Load members when Users tab is active
  useEffect(() => {
    const loadMembers = async () => {
      if (activeTab === 'users') {
        setIsLoadingMembers(true);
        try {
          // Superadmin: Fetch only barangay captains with barangay info
          // Others: Fetch users filtered by their barangay
          const url = userRole === 'superadmin' 
            ? '/api/users?include_barangay=true&captains_only=true'
            : `/api/users?barangay_id=${barangayId}`;
          
          console.log('🔍 Fetching members from:', url);
          const res = await fetch(url);
          const data = await res.json();
          console.log('📦 Members API Response:', data);
          console.log('👥 Number of members:', data.users?.length || 0);
          if (data.users && data.users.length > 0) {
            console.log('📋 First member sample:', data.users[0]);
            console.log('🏘️ First member barangay:', data.users[0]?.barangays);
          }
          if (res.ok) {
            setMembers(data.users || []);
          }
        } catch (error) {
          console.error('Error loading members:', error);
        } finally {
          setIsLoadingMembers(false);
        }
      }
    };
    loadMembers();
  }, [activeTab, barangayId, userRole]);

  const handleInviteUser = async () => {
    setInviteError('');
    setInviteSuccess('');
    setGeneratedCode('');

    // Check if barangay captain has created their barangay first
    if (userRole === 'barangay_captain' && !barangayId) {
      setInviteError('Please complete your barangay information in the General tab before inviting team members.');
      return;
    }

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setInviteError(data.error || 'Failed to create invitation');
        setIsInviting(false);
        return;
      }

      setInviteSuccess(`Invitation sent! Code: ${data.invitation.code}`);
      setGeneratedCode(data.invitation.code);
      setInviteEmail('');
      setInviteRole('staff');
      
      // Clear success message after 10 seconds
      setTimeout(() => {
        setInviteSuccess('');
        setGeneratedCode('');
      }, 10000);

    } catch (error) {
      console.error('Invitation error:', error);
      setInviteError('An error occurred while creating invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSave = async () => {
    if (activeTab === 'general') {
      try {
        setIsSavingBarangay(true);
        setSaveError('');
        setSaveSuccess('');

        // Validate
        if (!name) {
          setSaveError('Barangay name is required');
          setIsSavingBarangay(false);
          return;
        }

        if (!barangayId) {
          // CREATE new barangay
          if (userRole !== 'barangay_captain') {
            setSaveError('Only Barangay Captains can create barangays');
            setIsSavingBarangay(false);
            return;
          }

          const createRes = await fetch('/api/barangays', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              address,
              contact_number: contactNumber,
              email,
            }),
          });

          const createData = await createRes.json();

          if (!createRes.ok) {
            setSaveError(createData.error || 'Failed to create barangay');
            setIsSavingBarangay(false);
            return;
          }

          // Update local state with the created barangay
          // Note: API automatically updates user.barangay_id for the captain
          setBarangayId(createData.barangay.id);
          setName(createData.barangay.name || '');
          setAddress(createData.barangay.address || '');
          setContactNumber(createData.barangay.contact_number || '');
          setEmail(createData.barangay.email || '');
          setIsEditingBarangay(false);
          
          console.log('✅ Barangay created, ID:', createData.barangay.id);
          console.log('✅ Captain is now linked to barangay');
          
          setSaveSuccess('Barangay created successfully! You can now invite team members.');
          setTimeout(() => setSaveSuccess(''), 5000);
        } else {
          // UPDATE existing barangay
          const updateRes = await fetch('/api/barangays', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: barangayId,
              name,
              address,
              contact_number: contactNumber,
              email,
            }),
          });

          const updateData = await updateRes.json();

          if (updateRes.ok) {
            setSaveSuccess('Barangay updated successfully!');
            setIsEditingBarangay(false);
            setTimeout(() => {
              setSaveSuccess('');
            }, 3000);
          } else {
            setSaveError(updateData.error || 'Failed to update barangay');
          }
        }
      } catch (error: any) {
        console.error('Save error:', error);
        setSaveError('An error occurred');
      } finally {
        setIsSavingBarangay(false);
      }
    } else {
      alert('Settings saved!');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your application settings and preferences</p>
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>

      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow p-4 self-start sticky top-6">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors h-12 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-left flex-1">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-y-auto">
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Barangay Information</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    View your barangay details and system information
                  </p>
                </div>

                {isLoadingBarangay ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading barangay information...</span>
                  </div>
                ) : (
                  <>
                    {console.log('🎨 RENDER - barangayId:', barangayId, 'isEmpty:', !barangayId, 'userRole:', userRole)}
                    
                    {/* No Barangay - Superadmin */}
                    {!barangayId && userRole === 'superadmin' && (
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-8">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
                            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-2">
                              Superadmin Account
                            </h3>
                            <p className="text-purple-700 dark:text-purple-300 mb-4">
                              As a Superadmin, you have system-wide access and don't belong to any specific barangay. 
                              Your role is to manage the system and oversee all barangay operations.
                            </p>
                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                              <p className="text-sm text-purple-800 dark:text-purple-200 font-medium mb-2">
                                <strong>Your Capabilities:</strong>
                              </p>
                              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1 list-disc list-inside">
                                <li>Create and manage Barangay Captain accounts</li>
                                <li>View all barangay data across the system</li>
                                <li>Access system-wide reports and analytics</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Barangay - Barangay Captain (Create Form) */}
                    {!barangayId && userRole === 'barangay_captain' && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-8">
                          <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                              <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2">
                                Create Your Barangay
                              </h3>
                              <p className="text-blue-700 dark:text-blue-300">
                                Before you can invite team members, please set up your barangay information below.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Barangay Creation Form */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Barangay Information
                          </h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Barangay Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter barangay name"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Complete Address
                              </label>
                              <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter complete address"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Contact Number
                              </label>
                              <input
                                type="tel"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                placeholder="+63 XXX XXX XXXX"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="barangay@example.com"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* Success/Error Messages */}
                          {saveSuccess && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <p className="text-sm text-green-800 dark:text-green-200">{saveSuccess}</p>
                            </div>
                          )}

                          {saveError && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <p className="text-sm text-red-800 dark:text-red-200">{saveError}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* No Barangay - Other Roles (Not Captain) */}
                    {!barangayId && userRole !== 'superadmin' && userRole !== 'barangay_captain' && (
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-8">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg">
                            <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                              No Barangay Assigned
                            </h3>
                            <p className="text-yellow-700 dark:text-yellow-300">
                              Your account is not currently associated with any barangay. Please contact your Barangay Captain 
                              or system administrator to get assigned to a barangay.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Barangay Information Display - Beautiful Card Layout */}
                    {barangayId && (
                      <div className="space-y-6">
                        {/* Main Info Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-8">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start gap-4">
                              <div className="p-4 bg-blue-100 dark:bg-blue-800/50 rounded-xl">
                                <Globe className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                  {name || 'Barangay Name Not Set'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Barangay Information System
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Address */}
                            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                    Complete Address
                                  </p>
                                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                                    {address || 'Address not provided'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Contact Number */}
                            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                  <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                    Contact Number
                                  </p>
                                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                                    {contactNumber || 'Not provided'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Email */}
                            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-blue-100 dark:border-blue-800 md:col-span-2">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                    Email Address
                                  </p>
                                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                                    {email || 'Email not provided'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info Card */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            System Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                Barangay ID
                              </p>
                              <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                                {barangayId}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                Your Role
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                                {userRole?.replace('_', ' ')}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                Status
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  Active
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Help Card */}
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                                Need to update barangay information?
                              </h4>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                Contact your Barangay Captain or system administrator to update barangay details. 
                                Only authorized personnel can modify this information to maintain data integrity.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Profile Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Update your personal information</p>
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-2">
                      Change Photo
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-400">JPG, PNG or GIF. Max size 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Change Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Users - Invitation Management */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Barangay Setup Required for Captain */}
                {userRole === 'barangay_captain' && !barangayId ? (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400 dark:border-orange-600 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200 mb-2">
                          Complete Barangay Setup First
                        </h3>
                        <p className="text-sm text-orange-800 dark:text-orange-300 mb-3">
                          Before you can invite team members, you need to complete your barangay information in the <strong>General</strong> tab.
                        </p>
                        <button
                          onClick={() => setActiveTab('general')}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Go to General Settings
                        </button>
                      </div>
                    </div>
                  </div>
                ) : availableRoles.length === 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          No Permission to Create Invitations
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Your current role ({userRole}) does not have permission to create user invitations. 
                          Please contact a Superadmin or Barangay Captain if you need to invite new users.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : !showInviteForm ? (
                  <>
                    {/* Header with Add User Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {userRole === 'superadmin' ? 'Barangay Captains' : userRole === 'barangay_captain' ? 'Team Members' : 'Admin Users'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {userRole === 'superadmin' 
                            ? 'View all barangay captains and their assigned barangays' 
                            : 'Manage your barangay team members'}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowInviteForm(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        {userRole === 'superadmin' ? 'Add Captain' : 'Add User'}
                      </button>
                    </div>

                    {/* Members List */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      {isLoadingMembers ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading members...</span>
                        </div>
                      ) : members.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {userRole === 'superadmin' ? 'No Barangay Captains Yet' : 'No team members yet'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {userRole === 'superadmin' 
                              ? 'Create your first Barangay Captain to get started with the system' 
                              : 'Start building your team by inviting users'}
                          </p>
                        </div>
                      ) : userRole === 'superadmin' ? (
                        // Superadmin: Show captains in table format
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
                                  Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Contact
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {members.map((member: any) => (
                                <tr 
                                  key={member.id} 
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  {/* Captain Info */}
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                          {member.name || 'Unnamed Captain'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                          {member.email}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  
                                  {/* Barangay Name */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                      <div>
                                        {member.barangays?.name ? (
                                          <>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                              {member.barangays.name}
                                            </div>
                                            {member.barangays.email && (
                                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {member.barangays.email}
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                              Not Set Up
                                            </span>
                                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                                              Pending
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  
                                  {/* Location */}
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {member.barangays?.address || '—'}
                                    </div>
                                  </td>
                                  
                                  {/* Contact */}
                                  <td className="px-6 py-4">
                                    {member.barangays?.contact_number ? (
                                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                        <Bell className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <span>{member.barangays.contact_number}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">—</span>
                                    )}
                                  </td>
                                  
                                  {/* Status */}
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                      member.is_active 
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${
                                        member.is_active ? 'bg-green-500' : 'bg-gray-400'
                                      }`} />
                                      {member.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        // Other roles: Show information-style list
                        <div className="p-6 space-y-6">
                          {members.map((member) => (
                            <div key={member.id} className="space-y-1">
                              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                {member.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </div>
                              <div className="text-lg font-medium text-gray-900 dark:text-white">
                                {member.name || member.email}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                {/* Invite User Form */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Send className="w-5 h-5 text-blue-600" />
                      Send Invitation
                    </h3>
                    <button
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteEmail('');
                        setInviteError('');
                        setInviteSuccess('');
                        setGeneratedCode('');
                      }}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      ← Back to Members
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        disabled={availableRoles.length === 0}
                      >
                        {availableRoles.length > 0 ? (
                          availableRoles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))
                        ) : (
                          <option value="">No roles available</option>
                        )}
                      </select>
                      {userRole === 'superadmin' && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          As a Superadmin, you can only create Barangay Captains
                        </p>
                      )}
                      {userRole === 'barangay_captain' && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          As a Barangay Captain, you can create member roles for your barangay
                        </p>
                      )}
                      {userRole === 'secretary' && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          As a Secretary, you can only create Staff members
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleInviteUser}
                      disabled={isInviting || availableRoles.length === 0}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {isInviting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Invitation...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Invitation</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Success Message */}
                  {inviteSuccess && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            {inviteSuccess}
                          </p>
                          {generatedCode && (
                            <div className="mt-3 flex items-center gap-2">
                              <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded text-lg font-mono text-green-700 dark:text-green-300">
                                {generatedCode}
                              </code>
                              <button
                                onClick={copyCodeToClipboard}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                              >
                                {copiedCode ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                          <p className="mt-2 text-xs text-green-700 dark:text-green-300">
                            Share this code with the user. They will need it to complete registration.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {inviteError && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">{inviteError}</p>
                    </div>
                  )}
                </div>
                </>
                )}
              </div>
            )}

            {/* Save Button - Only show in General tab when editing or creating */}
            {activeTab === 'general' && (!barangayId || isEditingBarangay) && (
            <div className="mt-8 flex justify-end gap-3">
              {isEditingBarangay && (
                <button 
                  onClick={() => {
                    setIsEditingBarangay(false);
                    setSaveError('');
                    setSaveSuccess('');
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSavingBarangay || isLoadingBarangay}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingBarangay ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
