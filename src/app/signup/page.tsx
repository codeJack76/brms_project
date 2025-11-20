'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserPlus, Mail, Lock, User, MapPin, Building2, Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface InvitationData {
  email: string;
  barangay_name: string;
  role: string;
  position: string;
  invited_by_name: string;
}

export default function SignUpPage() {
  const { signUp, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState('');
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [checkingFirstUser, setCheckingFirstUser] = useState(true);

  // Check if this is the first user (no invitation needed)
  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const response = await fetch('/api/users?count_only=true');
        
        console.log('API Response status:', response.status);
        console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 500));
          setError('Server configuration error. Please check that your Supabase keys are configured in .env.local');
          setCheckingFirstUser(false);
          return;
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        console.log('User count:', data.count, 'Type:', typeof data.count);
        console.log('response.ok:', response.ok, 'response.status:', response.status);
        
        // Check if we got a valid count
        if (data && typeof data.count === 'number') {
          console.log(`✅ Got user count: ${data.count}`);
          console.log(`Decision: ${data.count === 0 ? 'FIRST USER (allow signup)' : 'USERS EXIST (require invitation)'}`);
          
          if (data.count === 0) {
            console.log('🎉 Setting isFirstUser = true');
            console.log('State BEFORE:', { isFirstUser, checkingFirstUser });
            setIsFirstUser(true);
            setCheckingFirstUser(false);
            console.log('State update called - should re-render with isFirstUser=true');
          } else {
            console.log('👥 Users exist, invitation required');
            setCheckingFirstUser(false);
          }
          return;
        }
        
        // If we reach here, something went wrong
        console.error('❌ Invalid response - no count field or wrong type');
        if (!response.ok) {
          console.error('API Error - Status:', response.status, 'Data:', data);
          setError(data.details || data.error || `Server error (${response.status})`);
        } else {
          setError('Unexpected response format from server');
        }
      } catch (err: any) {
        console.error('Error checking user count:', err);
        setError(`Failed to check user count: ${err.message}`);
      }
      
      setCheckingFirstUser(false);
    };

    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyInvitation(tokenParam);
      setCheckingFirstUser(false);
    } else {
      // No token - check if this is the first user
      checkFirstUser();
    }
  }, [searchParams]);

  const verifyInvitation = async (invitationToken: string) => {
    setVerifyingToken(true);
    setError('');

    try {
      const response = await fetch(`/api/users/invite?token=${invitationToken}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid or expired invitation');
        setVerifyingToken(false);
        return;
      }

      setInvitationData(data);
      setEmail(data.email);
      setVerifyingToken(false);
    } catch (err) {
      setError('Failed to verify invitation. Please try again.');
      setVerifyingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!isFirstUser && !token) {
      setError('No invitation token provided');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Auth0 handles signup - redirect to Auth0 with invitation token
      signUp(token);
      
      // The page will redirect to Auth0
      // No need to navigate - Auth0 will handle it
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
      setLoading(false);
    }
  };

  // Show loading while checking if first user or verifying token
  if (checkingFirstUser || verifyingToken) {
    console.log('🔄 Showing loading state:', { checkingFirstUser, verifyingToken });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {checkingFirstUser ? 'Loading...' : 'Verifying invitation...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if no token AND not first user
  console.log('🔍 Render decision:', { isFirstUser, token, checkingFirstUser });
  
  if (!isFirstUser && !token) {
    console.log('❌ Showing invitation required (isFirstUser=false, token=empty)');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Invitation Required
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Registration is by invitation only. Please contact your system administrator to request access.
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              isFirstUser ? 'bg-purple-600' : 'bg-green-600'
            }`}>
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isFirstUser ? 'Create Superadmin Account' : 'Complete Registration'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isFirstUser 
                ? 'Set up your superadmin account to get started' 
                : "You've been invited to join the BRMS"}
            </p>
          </div>

          {/* First User Notice */}
          {isFirstUser && (
            <div className="mb-8 p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-start">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    Welcome, First User!
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    As the first user, you'll be granted <strong>superadmin</strong> privileges with full system access. 
                    You'll be able to invite other users and manage all barangays.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Invitation Details */}
          {invitationData && (
            <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Valid Invitation
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You've been invited by <strong>{invitationData.invited_by_name}</strong>
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 ml-9">
                <div className="flex items-center text-sm">
                  <Building2 className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-green-800 dark:text-green-200">
                    <strong>Barangay:</strong> {invitationData.barangay_name}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-green-800 dark:text-green-200">
                    <strong>Role:</strong> {invitationData.role}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-green-800 dark:text-green-200">
                    <strong>Position:</strong> {invitationData.position}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Juan Dela Cruz"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isFirstUser}
                  required
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isFirstUser 
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                  }`}
                />
              </div>
              {!isFirstUser && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Email is pre-filled from your invitation
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
