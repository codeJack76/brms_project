'use client';

import React from 'react';
import { Shield, CheckCircle, XCircle, Info } from 'lucide-react';
import { PAGES, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS, formatRoleName, UserRole, PageId } from '@/lib/rbac';

interface RoleAccessDisplayProps {
  userRole: string;
}

export default function RoleAccessDisplay({ userRole }: RoleAccessDisplayProps) {
  const rolePermissions = ROLE_PERMISSIONS[userRole as UserRole] || [];
  const roleDescription = ROLE_DESCRIPTIONS[userRole as UserRole] || 'Unknown role';
  const allPages = Object.values(PAGES);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Your Access Permissions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Role: <span className="font-medium text-blue-600 dark:text-blue-400">{formatRoleName(userRole)}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {roleDescription}
          </p>
        </div>
      </div>

      {/* Access Summary */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>
            You have access to <strong>{rolePermissions.length} of {allPages.length}</strong> pages in the system
          </span>
        </div>
      </div>

      {/* Page Access List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Page Access Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {allPages.map((page) => {
            const hasAccess = rolePermissions.includes(page.id);
            
            return (
              <div
                key={page.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  hasAccess
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex-shrink-0">
                  {hasAccess ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    hasAccess
                      ? 'text-green-900 dark:text-green-200'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {page.label}
                  </p>
                  {hasAccess && (
                    <p className="text-xs text-green-700 dark:text-green-300 truncate">
                      {page.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          If you need access to additional pages, please contact your Barangay Captain or Superadmin
        </p>
      </div>
    </div>
  );
}
