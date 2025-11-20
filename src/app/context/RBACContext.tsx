'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

// Define user roles
export type UserRole = 'superadmin' | 'admin' | 'captain' | 'secretary' | 'treasurer' | 'health_worker';

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  superadmin: {
    canManageBarangays: true,
    canManageAllUsers: true,
    canManageUsers: true,
    canManageResidents: true,
    canManageDocuments: true,
    canManageClearances: true,
    canManageBlotter: true,
    canManageFinancials: true,
    canViewReports: true,
    canManageSettings: true,
    canApprove: true,
    canDelete: true,
    canViewAuditLogs: true,
    canManageSubscriptions: true,
  },
  admin: {
    canManageBarangays: false,
    canManageAllUsers: false,
    canManageUsers: true,
    canManageResidents: true,
    canManageDocuments: true,
    canManageClearances: true,
    canManageBlotter: true,
    canManageFinancials: true,
    canViewReports: true,
    canManageSettings: true,
    canApprove: true,
    canDelete: true,
    canViewAuditLogs: true,
    canManageSubscriptions: false,
  },
  captain: {
    canManageBarangays: false,
    canManageAllUsers: false,
    canManageUsers: false,
    canManageResidents: true,
    canManageDocuments: true,
    canManageClearances: true,
    canManageBlotter: true,
    canManageFinancials: true,
    canViewReports: true,
    canManageSettings: false,
    canApprove: true,
    canDelete: true,
    canViewAuditLogs: false,
    canManageSubscriptions: false,
  },
  secretary: {
    canManageBarangays: false,
    canManageAllUsers: false,
    canManageUsers: false,
    canManageResidents: true,
    canManageDocuments: true,
    canManageClearances: true,
    canManageBlotter: true,
    canManageFinancials: false,
    canViewReports: true,
    canManageSettings: false,
    canApprove: false,
    canDelete: false,
    canViewAuditLogs: false,
    canManageSubscriptions: false,
  },
  treasurer: {
    canManageBarangays: false,
    canManageAllUsers: false,
    canManageUsers: false,
    canManageResidents: false,
    canManageDocuments: true,
    canManageClearances: false,
    canManageBlotter: false,
    canManageFinancials: true,
    canViewReports: true,
    canManageSettings: false,
    canApprove: true,
    canDelete: false,
    canViewAuditLogs: false,
    canManageSubscriptions: false,
  },
  health_worker: {
    canManageBarangays: false,
    canManageAllUsers: false,
    canManageUsers: false,
    canManageResidents: true,
    canManageDocuments: true,
    canManageClearances: false,
    canManageBlotter: false,
    canManageFinancials: false,
    canViewReports: true,
    canManageSettings: false,
    canApprove: false,
    canDelete: false,
    canViewAuditLogs: false,
    canManageSubscriptions: false,
  },
};

interface Barangay {
  id: string;
  name: string;
  code: string;
  city_municipality: string;
  province: string;
}

interface RBACContextType {
  userRole: UserRole | null;
  permissions: typeof ROLE_PERMISSIONS.superadmin | null;
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS.superadmin) => boolean;
  isRole: (role: UserRole | UserRole[]) => boolean;
  supabaseUser: any | null;
  userName: string | null;
  barangay: Barangay | null;
  isSuperadmin: boolean;
  loading: boolean;
}

const RBACContext = createContext<RBACContextType>({
  userRole: null,
  permissions: null,
  hasPermission: () => false,
  isRole: () => false,
  supabaseUser: null,
  userName: null,
  barangay: null,
  isSuperadmin: false,
  loading: true,
});

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider');
  }
  return context;
};

interface RBACProviderProps {
  children: ReactNode;
}

export function RBACProvider({ children }: RBACProviderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [syncedUser, setSyncedUser] = useState<any>(null);
  const [barangayData, setBarangayData] = useState<Barangay | null>(null);
  const [loading, setLoading] = useState(true);

  const userRole: UserRole | null = syncedUser?.role || null;
  const permissions = userRole ? ROLE_PERMISSIONS[userRole] : null;
  const userName = syncedUser?.name || user?.email?.split('@')[0] || null;
  const isSuperadmin = userRole === 'superadmin';

  // Fetch user data from database when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        setSyncedUser(null);
        setBarangayData(null);
        return;
      }

      try {
        console.log('=== Fetching user data ===');
        console.log('User:', user.id, user.email);

        // With Auth0, the session is managed server-side
        // We just use the synced user data from AuthContext
        setSyncedUser(user);

        // Fetch barangay data if user has barangay_id
        if (user.barangay_id && user.role !== 'superadmin') {
          const barangayResponse = await fetch(`/api/barangays/${user.barangay_id}`);

          if (barangayResponse.ok) {
            const barangay = await barangayResponse.json();
            console.log('Barangay data:', barangay);
            setBarangayData(barangay);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  const hasPermission = (permission: keyof typeof ROLE_PERMISSIONS.superadmin): boolean => {
    if (!permissions) return false;
    return permissions[permission] === true;
  };

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!userRole) return false;
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  };

  return (
    <RBACContext.Provider
      value={{
        userRole,
        permissions,
        hasPermission,
        isRole,
        supabaseUser: syncedUser,
        userName,
        barangay: barangayData,
        isSuperadmin,
        loading,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
}
