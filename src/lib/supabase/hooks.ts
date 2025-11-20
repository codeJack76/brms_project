// Supabase React Hooks
// Custom hooks for common database operations

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Create a typed client for hooks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

type Tables = Database['public']['Tables'];

// Generic hook for fetching data from any table
export function useSupabaseQuery<T extends keyof Tables>(
  table: T,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from(table).select(options?.select || '*');

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value) as any;
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        }) as any;
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setData(result as any[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for residents data
export function useResidents(filters?: {
  is_active?: boolean;
  barangay?: string;
  purok?: string;
  limit?: number;
}) {
  return useSupabaseQuery('residents', {
    filters,
    orderBy: { column: 'last_name', ascending: true },
  });
}

// Hook for documents data
export function useDocuments(filters?: {
  resident_id?: string;
  status?: string;
  document_type?: string;
  limit?: number;
}) {
  return useSupabaseQuery('documents', {
    filters,
    orderBy: { column: 'created_at', ascending: false },
  });
}

// Hook for blotter records
export function useBlotterRecords(filters?: {
  status?: string;
  incident_type?: string;
  limit?: number;
}) {
  return useSupabaseQuery('blotter_records', {
    filters,
    orderBy: { column: 'incident_date', ascending: false },
  });
}

// Hook for financial transactions
export function useFinancialTransactions(filters?: {
  transaction_type?: string;
  category?: string;
  resident_id?: string;
  limit?: number;
}) {
  return useSupabaseQuery('financial_transactions', {
    filters,
    orderBy: { column: 'transaction_date', ascending: false },
  });
}

// Hook for real-time subscriptions
export function useSupabaseSubscription<T extends keyof Tables>(
  table: T,
  callback: (payload: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table as string },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
}

// Generic insert function  
export async function insertRecord(table: string, data: any) {
  const { data: result, error } = await (supabase as any)
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

// Generic update function
export async function updateRecord(table: string, id: string, data: any) {
  const { data: result, error } = await (supabase as any)
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

// Generic delete function
export async function deleteRecord(table: string, id: string) {
  const { error } = await (supabase as any).from(table).delete().eq('id', id);

  if (error) throw error;
}

// Soft delete (archive) function
export async function archiveRecord(table: string, id: string) {
  const { error } = await (supabase as any)
    .from(table)
    .update({ is_archived: true })
    .eq('id', id);

  if (error) throw error;
}

// Search residents
export async function searchResidents(query: string) {
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,mobile.ilike.%${query}%`
    )
    .limit(20);

  if (error) throw error;
  return data;
}

// Get resident by ID with related data
export async function getResidentDetails(id: string) {
  const [resident, documents, blotterRecords, transactions] = await Promise.all([
    supabase.from('residents').select('*').eq('id', id).single(),
    supabase.from('documents').select('*').eq('resident_id', id).order('created_at', { ascending: false }),
    supabase
      .from('blotter_records')
      .select('*')
      .or(`complainant_id.eq.${id},respondent_id.eq.${id}`)
      .order('incident_date', { ascending: false }),
    supabase
      .from('financial_transactions')
      .select('*')
      .eq('resident_id', id)
      .order('transaction_date', { ascending: false }),
  ]);

  if (resident.error) throw resident.error;

  return {
    resident: resident.data,
    documents: documents.data || [],
    blotterRecords: blotterRecords.data || [],
    transactions: transactions.data || [],
  };
}

// Get dashboard statistics
export async function getDashboardStats() {
  const [residents, documents, blotter, financial] = await Promise.all([
    supabase.from('residents').select('id', { count: 'exact', head: true }),
    supabase.from('documents').select('id', { count: 'exact', head: true }),
    supabase
      .from('blotter_records')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('financial_transactions')
      .select('amount')
      .gte('transaction_date', new Date(new Date().getFullYear(), 0, 1).toISOString()),
  ]);

  const totalRevenue = (financial.data as any)?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

  return {
    totalResidents: residents.count || 0,
    totalDocuments: documents.count || 0,
    openBlotterRecords: blotter.count || 0,
    yearlyRevenue: totalRevenue,
  };
}