// Supabase Library - Main Entry Point
// Import from '@/lib/supabase' in your components

// Client exports (for React components)
export { supabase } from './client';

// Server exports (for API routes only)
export { supabaseAdmin } from './server';

// Hooks (for React components)
export {
  useSupabaseQuery,
  useResidents,
  useDocuments,
  useBlotterRecords,
  useFinancialTransactions,
  useSupabaseSubscription,
  insertRecord,
  updateRecord,
  deleteRecord,
  archiveRecord,
  searchResidents,
  getResidentDetails,
  getDashboardStats,
} from './hooks';

// Types
export type { Database } from './database.types';
