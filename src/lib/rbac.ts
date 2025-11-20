/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines what pages and features each role can access
 */

export type UserRole = 
  | 'superadmin'
  | 'barangay_captain'
  | 'secretary'
  | 'treasurer'
  | 'staff'
  | 'peace_order_officer'
  | 'health_officer'
  | 'social_worker';

export type PageId = 
  | 'dashboard'
  | 'residents'
  | 'documents'
  | 'clearances'
  | 'blotter'
  | 'financial'
  | 'reports'
  | 'settings';

export interface PageConfig {
  id: PageId;
  label: string;
  description: string;
  icon?: string;
}

export const PAGES: Record<PageId, PageConfig> = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Overview of barangay statistics and activities'
  },
  residents: {
    id: 'residents',
    label: 'Residents',
    description: 'Manage resident records and information'
  },
  documents: {
    id: 'documents',
    label: 'Documents',
    description: 'Manage barangay documents and files'
  },
  clearances: {
    id: 'clearances',
    label: 'Clearances',
    description: 'Process and manage barangay clearances'
  },
  blotter: {
    id: 'blotter',
    label: 'Blotter',
    description: 'Record and manage incident reports'
  },
  financial: {
    id: 'financial',
    label: 'Financial',
    description: 'Track financial transactions and records'
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    description: 'Generate and view various reports'
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    description: 'Configure system and user settings'
  }
};

/**
 * Role-based page access permissions
 * Each role maps to an array of pages they can access
 */
export const ROLE_PERMISSIONS: Record<UserRole, PageId[]> = {
  // Superadmin: Full system access
  superadmin: [
    'dashboard',
    'residents',
    'documents',
    'clearances',
    'blotter',
    'financial',
    'reports',
    'settings'
  ],
  
  // Barangay Captain: Full operational access
  barangay_captain: [
    'dashboard',
    'residents',
    'documents',
    'clearances',
    'blotter',
    'financial',
    'reports',
    'settings'
  ],
  
  // Secretary: Administrative and documentation access
  secretary: [
    'dashboard',
    'residents',
    'documents',
    'clearances',
    'reports',
    'settings'
  ],
  
  // Treasurer: Financial and reporting access
  treasurer: [
    'dashboard',
    'financial',
    'reports',
    'settings'
  ],
  
  // Staff: General administrative support
  staff: [
    'dashboard',
    'residents',
    'documents',
    'clearances',
    'settings'
  ],
  
  // Peace & Order Officer: Blotter and incident management
  peace_order_officer: [
    'dashboard',
    'residents',
    'blotter',
    'reports',
    'settings'
  ],
  
  // Health Officer: Health-related records and reports
  health_officer: [
    'dashboard',
    'residents',
    'documents',
    'reports',
    'settings'
  ],
  
  // Social Worker: Resident welfare and assistance
  social_worker: [
    'dashboard',
    'residents',
    'documents',
    'reports',
    'settings'
  ]
};

/**
 * Role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  superadmin: 'Full system administrator with all permissions',
  barangay_captain: 'Barangay leader with full operational access',
  secretary: 'Handles documentation and administrative tasks',
  treasurer: 'Manages financial records and transactions',
  staff: 'General administrative support staff',
  peace_order_officer: 'Manages peace and order, blotter records',
  health_officer: 'Oversees health-related programs and records',
  social_worker: 'Manages social welfare and assistance programs'
};

/**
 * Check if a role has access to a specific page
 */
export function hasPageAccess(role: UserRole | string, pageId: PageId): boolean {
  if (!role) return false;
  
  const permissions = ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) return false;
  
  return permissions.includes(pageId);
}

/**
 * Get all accessible pages for a role
 */
export function getAccessiblePages(role: UserRole | string): PageConfig[] {
  if (!role) return [];
  
  const pageIds = ROLE_PERMISSIONS[role as UserRole] || [];
  return pageIds.map(id => PAGES[id]);
}

/**
 * Get the default landing page for a role
 */
export function getDefaultPage(role: UserRole | string): PageId {
  const accessiblePages = getAccessiblePages(role);
  
  // Always try to return dashboard if accessible
  if (accessiblePages.find(p => p.id === 'dashboard')) {
    return 'dashboard';
  }
  
  // Otherwise return the first accessible page
  return accessiblePages[0]?.id || 'dashboard';
}

/**
 * Format role name for display
 */
export function formatRoleName(role: string): string {
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
