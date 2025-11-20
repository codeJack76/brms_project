'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';

export default function NoInvitationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Error Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
              <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              No Invitation Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              You don't have permission to access this system
            </p>
          </div>

          {/* Details */}
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3">
              Why am I seeing this?
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              Access to the Barangay Records Management System is restricted to invited users only.
            </p>
            <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You may have signed up without a valid invitation</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your invitation may have expired</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your account may not have been properly configured</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Need Access?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  Contact your barangay administrator to request an invitation.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  They can send you a valid invitation link to create your account.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Sign In</span>
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              This is a secure B2B system for barangay management. <br />
              Public registration is not available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
