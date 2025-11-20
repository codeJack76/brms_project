'use client';

import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';
import { useRBAC, UserRole } from '../context/RBACContext';
import { Shield, AlertTriangle } from 'lucide-react';

interface ProtectedProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: UserRole | UserRole[];
  requirePermission?: string;
  fallback?: ReactNode;
}

export function Protected({
  children,
  requireAuth = true,
  requireRole,
  requirePermission,
  fallback,
}: ProtectedProps) {
  const { user, loading } = useAuth();
  const { isRole, hasPermission } = useRBAC();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access this content
          </p>
        </div>
      </div>
    );
  }

  // Check role
  if (requireRole && !isRole(requireRole)) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this content
          </p>
        </div>
      </div>
    );
  }

  // Check permission
  if (requirePermission && !hasPermission(requirePermission as any)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Component to hide/show elements based on permissions
interface CanProps {
  do: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ do: permission, children, fallback = null }: CanProps) {
  const { hasPermission } = useRBAC();

  if (hasPermission(permission as any)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Component to check if user has specific role
interface IsRoleProps {
  role: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function IsRole({ role, children, fallback = null }: IsRoleProps) {
  const { isRole } = useRBAC();

  if (isRole(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
