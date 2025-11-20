'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function SignUpSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Registration Complete!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your account has been created successfully
            </p>
          </div>

          {/* Details */}
          <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">
              What's next?
            </h3>
            <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Your account is now active and ready to use</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>You can sign in with your email and password</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Your role and permissions have been configured</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <span>Continue to Sign In</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Welcome to the Barangay Records Management System. <br />
              If you have any questions, contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
