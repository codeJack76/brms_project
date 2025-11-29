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

// GET /api/dashboard - Get dashboard statistics
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

    // Helper to add barangay filter for tables with barangay_id
    const addBarangayFilter = (query: any) => {
      if (!isSuperAdmin && barangayId) {
        return query.eq('barangay_id', barangayId);
      }
      return query;
    };

    // Get current date info for monthly comparisons
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthStart = new Date(thisYear, thisMonth, 1).toISOString();
    const lastMonthStart = new Date(lastMonthYear, lastMonth, 1).toISOString();

    // Fetch all data in parallel
    const [
      residentsResult,
      residentsLastMonthResult,
      clearancesResult,
      documentsResult,
      blottersResult,
      recentActivitiesResult,
      financialResult,
    ] = await Promise.all([
      // Total residents (active) - use barangay_id filter
      addBarangayFilter(
        supabaseAdmin
          .from('residents')
          .select('id, gender, birth_date, created_at', { count: 'exact' })
          .eq('is_active', true)
      ),
      // Residents added last month (for comparison) - use barangay_id filter
      addBarangayFilter(
        supabaseAdmin
          .from('residents')
          .select('id', { count: 'exact' })
          .eq('is_active', true)
          .gte('created_at', lastMonthStart)
          .lt('created_at', thisMonthStart)
      ),
      // Clearances - use barangay_id filter
      addBarangayFilter(
        supabaseAdmin
          .from('clearances')
          .select('id, status, created_at, type_of_clearance, amount_paid, clearance_fee_paid')
      ),
      // Documents - use barangay_id filter
      addBarangayFilter(
        supabaseAdmin
          .from('barangay_documents')
          .select('id, uploaded_at', { count: 'exact' })
      ),
      // Blotter records - use barangay_id filter (table name is 'blotter')
      addBarangayFilter(
        supabaseAdmin
          .from('blotter')
          .select('id, status, created_at, incident_type')
      ),
      // Recent activity logs - use barangay_id filter
      addBarangayFilter(
        supabaseAdmin
          .from('barangay_activity_logs')
          .select('*, users:user_id(name, email)')
          .order('created_at', { ascending: false })
          .limit(10)
      ),
      // Financial transactions - use barangay_id filter
      addBarangayFilter(
        supabaseAdmin
          .from('financial_transactions')
          .select('id, type, amount, status, transaction_date, category')
          .eq('status', 'completed')
      ),
    ]);

    // Process residents data
    const residents = residentsResult.data || [];
    const totalResidents = residents.length;
    const residentsLastMonth = residentsLastMonthResult.data?.length || 0;
    const residentsThisMonth = residents.filter(
      (r: any) => new Date(r.created_at) >= new Date(thisMonthStart)
    ).length;

    // Calculate resident growth percentage
    const residentGrowth =
      residentsLastMonth > 0
        ? Math.round(((residentsThisMonth - residentsLastMonth) / residentsLastMonth) * 100)
        : residentsThisMonth > 0
        ? 100
        : 0;

    // Demographics
    const maleCount = residents.filter((r: any) => r.gender?.toLowerCase() === 'male').length;
    const femaleCount = residents.filter((r: any) => r.gender?.toLowerCase() === 'female').length;

    // Age distribution
    const calculateAge = (dob: string) => {
      const birthDate = new Date(dob);
      const age = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        return age - 1;
      }
      return age;
    };

    let minors = 0; // 0-17
    let adults = 0; // 18-59
    let seniors = 0; // 60+

    residents.forEach((r: any) => {
      if (r.birth_date) {
        const age = calculateAge(r.birth_date);
        if (age < 18) minors++;
        else if (age < 60) adults++;
        else seniors++;
      }
    });

    // Process clearances data
    const clearances = clearancesResult.data || [];
    const totalClearances = clearances.length;
    const pendingClearances = clearances.filter((c: any) => c.status === 'Pending').length;
    const approvedClearances = clearances.filter((c: any) => c.status === 'Approved').length;
    const releasedClearances = clearances.filter((c: any) => c.status === 'Released').length;

    const clearancesThisMonth = clearances.filter(
      (c: any) => new Date(c.created_at) >= new Date(thisMonthStart)
    ).length;
    const clearancesLastMonth = clearances.filter(
      (c: any) =>
        new Date(c.created_at) >= new Date(lastMonthStart) &&
        new Date(c.created_at) < new Date(thisMonthStart)
    ).length;

    const clearanceGrowth =
      clearancesLastMonth > 0
        ? Math.round(((clearancesThisMonth - clearancesLastMonth) / clearancesLastMonth) * 100)
        : clearancesThisMonth > 0
        ? 100
        : 0;

    // Process documents data
    const totalDocuments = documentsResult.data?.length || 0;
    const documentsThisMonth = (documentsResult.data || []).filter(
      (d: any) => new Date(d.uploaded_at) >= new Date(thisMonthStart)
    ).length;
    const documentsLastMonth = (documentsResult.data || []).filter(
      (d: any) =>
        new Date(d.uploaded_at) >= new Date(lastMonthStart) &&
        new Date(d.uploaded_at) < new Date(thisMonthStart)
    ).length;

    const documentGrowth =
      documentsLastMonth > 0
        ? Math.round(((documentsThisMonth - documentsLastMonth) / documentsLastMonth) * 100)
        : documentsThisMonth > 0
        ? 100
        : 0;

    // Process blotter data
    const blotters = blottersResult.data || [];
    const activeBlotters = blotters.filter(
      (b: any) => b.status !== 'Resolved' && b.status !== 'Dismissed'
    ).length;
    const totalBlotters = blotters.length;

    const blottersThisMonth = blotters.filter(
      (b: any) => new Date(b.created_at) >= new Date(thisMonthStart)
    ).length;
    const blottersLastMonth = blotters.filter(
      (b: any) =>
        new Date(b.created_at) >= new Date(lastMonthStart) &&
        new Date(b.created_at) < new Date(thisMonthStart)
    ).length;

    const blotterChange =
      blottersLastMonth > 0
        ? Math.round(((blottersThisMonth - blottersLastMonth) / blottersLastMonth) * 100)
        : blottersThisMonth > 0
        ? 100
        : 0;

    // Process financial data
    const transactions = financialResult.data || [];
    let totalIncome = 0;
    let totalExpenses = 0;
    let thisMonthIncome = 0;
    let thisMonthExpenses = 0;

    transactions.forEach((txn: any) => {
      const amount = parseFloat(txn.amount) || 0;
      const txnDate = new Date(txn.transaction_date);

      if (txn.type === 'income') {
        totalIncome += amount;
        if (txnDate >= new Date(thisMonthStart)) {
          thisMonthIncome += amount;
        }
      } else {
        totalExpenses += amount;
        if (txnDate >= new Date(thisMonthStart)) {
          thisMonthExpenses += amount;
        }
      }
    });

    // Process recent activities
    const recentActivities = (recentActivitiesResult.data || []).map((activity: any) => ({
      id: activity.id,
      action: activity.action,
      details: activity.details,
      timestamp: activity.created_at,
      userName: activity.users?.name || activity.users?.email || 'Unknown User',
    }));

    // Build response
    const dashboardData = {
      user: {
        name: userData.name,
        role: userData.role,
      },
      stats: {
        residents: {
          total: totalResidents,
          growth: residentGrowth,
          thisMonth: residentsThisMonth,
        },
        clearances: {
          total: totalClearances,
          pending: pendingClearances,
          approved: approvedClearances,
          released: releasedClearances,
          growth: clearanceGrowth,
          thisMonth: clearancesThisMonth,
        },
        documents: {
          total: totalDocuments,
          growth: documentGrowth,
          thisMonth: documentsThisMonth,
        },
        blotters: {
          total: totalBlotters,
          active: activeBlotters,
          change: blotterChange,
          thisMonth: blottersThisMonth,
        },
        financial: {
          totalIncome,
          totalExpenses,
          netIncome: totalIncome - totalExpenses,
          thisMonthIncome,
          thisMonthExpenses,
        },
      },
      demographics: {
        male: maleCount,
        female: femaleCount,
        malePercent: totalResidents > 0 ? Math.round((maleCount / totalResidents) * 100) : 0,
        femalePercent: totalResidents > 0 ? Math.round((femaleCount / totalResidents) * 100) : 0,
        ageDistribution: {
          minors,
          adults,
          seniors,
        },
      },
      recentActivities,
    };

    return NextResponse.json(dashboardData);
  } catch (error: unknown) {
    console.error('Error fetching dashboard data:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: message },
      { status: 500 }
    );
  }
}
