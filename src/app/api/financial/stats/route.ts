import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to get user's barangay_id from cookie
async function getUserBarangay(request: NextRequest) {
  const userEmail = request.cookies.get('user_email')?.value;
  
  if (!userEmail) {
    return { error: 'Unauthorized - Please log in', status: 401 };
  }

  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('barangay_id, role')
    .eq('email', userEmail)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
    return { error: 'Failed to fetch user information', status: 500 };
  }

  return { userData, userEmail };
}

// GET /api/financial/stats - Get financial statistics for the user's barangay
export async function GET(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;

    // Build base query for filtering by barangay
    const buildQuery = () => {
      let query = supabaseAdmin.from('financial_transactions').select('*');
      if (userData.role !== 'superadmin' && userData.barangay_id) {
        query = query.eq('barangay_id', userData.barangay_id);
      }
      return query;
    };

    // Get all transactions (only completed ones for totals)
    const { data: allTransactions, error: allError } = await buildQuery()
      .eq('status', 'completed');

    if (allError) {
      console.error('Supabase error:', allError);
      return NextResponse.json({ error: allError.message }, { status: 500 });
    }

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let thisMonthIncome = 0;
    let thisMonthExpenses = 0;
    let lastMonthIncome = 0;
    let lastMonthExpenses = 0;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    allTransactions?.forEach((txn: any) => {
      const amount = parseFloat(txn.amount);
      const txnDate = new Date(txn.transaction_date);
      const txnMonth = txnDate.getMonth();
      const txnYear = txnDate.getFullYear();

      if (txn.type === 'income') {
        totalIncome += amount;
        if (txnMonth === thisMonth && txnYear === thisYear) {
          thisMonthIncome += amount;
        }
        if (txnMonth === lastMonth && txnYear === lastMonthYear) {
          lastMonthIncome += amount;
        }
      } else {
        totalExpenses += amount;
        if (txnMonth === thisMonth && txnYear === thisYear) {
          thisMonthExpenses += amount;
        }
        if (txnMonth === lastMonth && txnYear === lastMonthYear) {
          lastMonthExpenses += amount;
        }
      }
    });

    const netIncome = totalIncome - totalExpenses;
    const thisMonthNet = thisMonthIncome - thisMonthExpenses;
    const lastMonthNet = lastMonthIncome - lastMonthExpenses;

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const incomeChange = calculateChange(thisMonthIncome, lastMonthIncome);
    const expenseChange = calculateChange(thisMonthExpenses, lastMonthExpenses);
    const netChange = calculateChange(thisMonthNet, lastMonthNet);

    // Get transaction counts by status
    const { data: allTxns, error: countError } = await buildQuery();
    
    let pendingCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    allTxns?.forEach((txn: any) => {
      if (txn.status === 'pending') pendingCount++;
      else if (txn.status === 'completed') completedCount++;
      else if (txn.status === 'cancelled') cancelledCount++;
    });

    // Get category breakdown for income
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    allTransactions?.forEach((txn: any) => {
      const amount = parseFloat(txn.amount);
      if (txn.type === 'income') {
        incomeByCategory[txn.category] = (incomeByCategory[txn.category] || 0) + amount;
      } else {
        expenseByCategory[txn.category] = (expenseByCategory[txn.category] || 0) + amount;
      }
    });

    const stats = {
      totalIncome,
      totalExpenses,
      netIncome,
      thisMonthIncome,
      thisMonthExpenses,
      thisMonthNet,
      incomeChange: Math.round(incomeChange * 10) / 10,
      expenseChange: Math.round(expenseChange * 10) / 10,
      netChange: Math.round(netChange * 10) / 10,
      pendingCount,
      completedCount,
      cancelledCount,
      totalTransactions: allTxns?.length || 0,
      incomeByCategory,
      expenseByCategory,
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error fetching financial stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial statistics', details: error.message },
      { status: 500 }
    );
  }
}
