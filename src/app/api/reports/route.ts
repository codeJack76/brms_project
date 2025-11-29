import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to get user's barangay_id from cookie
async function getUserBarangay(request: NextRequest) {
  const userEmail = request.cookies.get('user_email')?.value;

  if (!userEmail) {
    return { error: 'Unauthorized - Please log in', status: 401 };
  }

  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, barangay_id, role, name')
    .eq('email', userEmail)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
    return { error: 'Failed to fetch user information', status: 500 };
  }

  return { userData, userEmail };
}

// GET /api/reports - Get report statistics and counts
export async function GET(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);

    if ('error' in userResult) {
      return NextResponse.json(
        { error: userResult.error },
        { status: userResult.status }
      );
    }

    const { userData } = userResult;
    const barangayId = userData.barangay_id;
    const isSuperAdmin = userData.role === 'superadmin';

    // Helper to add barangay filter
    const addBarangayFilter = (query: any) => {
      if (!isSuperAdmin && barangayId) {
        return query.eq('barangay_id', barangayId);
      }
      return query;
    };

    // Get current date info
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Fetch all counts in parallel
    const [
      residentsResult,
      clearancesResult,
      blotterResult,
      financialResult,
    ] = await Promise.all([
      // Residents count
      addBarangayFilter(
        supabaseAdmin
          .from('residents')
          .select('id', { count: 'exact' })
          .eq('is_active', true)
      ),
      // Clearances count
      addBarangayFilter(
        supabaseAdmin
          .from('clearances')
          .select('id, created_at', { count: 'exact' })
      ),
      // Blotter count
      addBarangayFilter(
        supabaseAdmin
          .from('blotter')
          .select('id, created_at', { count: 'exact' })
      ),
      // Financial transactions count
      addBarangayFilter(
        supabaseAdmin
          .from('financial_transactions')
          .select('id, transaction_date', { count: 'exact' })
      ),
    ]);

    // Calculate this month counts
    const clearancesThisMonth = (clearancesResult.data || []).filter(
      (c: any) => new Date(c.created_at) >= new Date(thisMonthStart)
    ).length;

    const blotterThisMonth = (blotterResult.data || []).filter(
      (b: any) => new Date(b.created_at) >= new Date(thisMonthStart)
    ).length;

    const financialThisMonth = (financialResult.data || []).filter(
      (f: any) => new Date(f.transaction_date) >= new Date(thisMonthStart)
    ).length;

    const reportCounts = {
      residents: {
        total: residentsResult.data?.length || 0,
        thisMonth: (residentsResult.data || []).length, // All active residents
      },
      clearances: {
        total: clearancesResult.data?.length || 0,
        thisMonth: clearancesThisMonth,
      },
      blotter: {
        total: blotterResult.data?.length || 0,
        thisMonth: blotterThisMonth,
      },
      financial: {
        total: financialResult.data?.length || 0,
        thisMonth: financialThisMonth,
      },
    };

    // Calculate total reports this month
    const totalThisMonth =
      clearancesThisMonth + blotterThisMonth + financialThisMonth;

    return NextResponse.json({
      counts: reportCounts,
      summary: {
        totalRecords:
          reportCounts.residents.total +
          reportCounts.clearances.total +
          reportCounts.blotter.total +
          reportCounts.financial.total,
        thisMonth: totalThisMonth,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching report stats:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch report statistics', details: message },
      { status: 500 }
    );
  }
}
