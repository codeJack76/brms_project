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

  // Get barangay name
  let barangayName = 'All Barangays';
  if (userData.barangay_id) {
    const { data: barangayData } = await supabaseAdmin
      .from('barangays')
      .select('name')
      .eq('id', userData.barangay_id)
      .single();
    barangayName = barangayData?.name || 'Unknown Barangay';
  }

  return { userData, userEmail, barangayName };
}

// Helper to get date range based on period
function getDateRange(period: string, startDate?: string, endDate?: string) {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (period) {
    case 'daily':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'yearly':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
      end = endDate ? new Date(endDate) : now;
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

// POST /api/reports/generate - Generate report data
export async function POST(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);

    if ('error' in userResult) {
      return NextResponse.json(
        { error: userResult.error },
        { status: userResult.status }
      );
    }

    const { userData, barangayName } = userResult;
    const barangayId = userData.barangay_id;
    const isSuperAdmin = userData.role === 'superadmin';

    const body = await request.json();
    const { reportType, period, startDate, endDate } = body;

    if (!reportType) {
      return NextResponse.json(
        { error: 'Report type is required' },
        { status: 400 }
      );
    }

    const dateRange = getDateRange(period || 'monthly', startDate, endDate);

    // Helper to add barangay filter
    const addBarangayFilter = (query: any) => {
      if (!isSuperAdmin && barangayId) {
        return query.eq('barangay_id', barangayId);
      }
      return query;
    };

    let reportData: any = null;
    let reportTitle = '';
    let columns: string[] = [];

    switch (reportType) {
      case 'residents': {
        reportTitle = 'Residents Report';
        columns = ['Name', 'Gender', 'Birth Date', 'Civil Status', 'Address', 'Contact', 'Status'];
        
        let query = supabaseAdmin
          .from('residents')
          .select('*')
          .eq('is_active', true)
          .order('last_name', { ascending: true });

        query = addBarangayFilter(query);
        const { data, error } = await query;

        if (error) throw error;

        reportData = (data || []).map((r: any) => ({
          name: `${r.last_name}, ${r.first_name} ${r.middle_name || ''}`.trim(),
          gender: r.gender || 'N/A',
          birthDate: r.birth_date || 'N/A',
          civilStatus: r.civil_status || 'N/A',
          address: r.address || 'N/A',
          contact: r.mobile || r.email || 'N/A',
          status: r.is_active ? 'Active' : 'Inactive',
        }));
        break;
      }

      case 'clearances': {
        reportTitle = 'Clearances Report';
        columns = ['Control No.', 'Resident Name', 'Type', 'Purpose', 'Status', 'Amount', 'Date Issued'];
        
        let query = supabaseAdmin
          .from('clearances')
          .select('*')
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end)
          .order('created_at', { ascending: false });

        query = addBarangayFilter(query);
        const { data, error } = await query;

        if (error) throw error;

        reportData = (data || []).map((c: any) => ({
          controlNo: c.control_number || c.id.substring(0, 8).toUpperCase(),
          residentName: c.resident_name || 'N/A',
          type: c.type_of_clearance || 'N/A',
          purpose: c.purpose || 'N/A',
          status: c.status || 'N/A',
          amount: c.amount_paid ? `₱${parseFloat(c.amount_paid).toFixed(2)}` : '₱0.00',
          dateIssued: c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A',
        }));
        break;
      }

      case 'blotter': {
        reportTitle = 'Blotter Report';
        columns = ['Case No.', 'Complainant', 'Respondent', 'Incident Type', 'Date', 'Location', 'Status'];
        
        let query = supabaseAdmin
          .from('blotter')
          .select('*')
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end)
          .order('created_at', { ascending: false });

        query = addBarangayFilter(query);
        const { data, error } = await query;

        if (error) throw error;

        reportData = (data || []).map((b: any) => ({
          caseNo: b.case_number || 'N/A',
          complainant: b.complainant || 'N/A',
          respondent: b.respondent || 'N/A',
          incidentType: b.incident_type || 'N/A',
          date: b.incident_date ? new Date(b.incident_date).toLocaleDateString() : 'N/A',
          location: b.location || 'N/A',
          status: b.status || 'N/A',
        }));
        break;
      }

      case 'financial': {
        reportTitle = 'Financial Report';
        columns = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Status'];
        
        let query = supabaseAdmin
          .from('financial_transactions')
          .select('*')
          .gte('transaction_date', dateRange.start)
          .lte('transaction_date', dateRange.end)
          .order('transaction_date', { ascending: false });

        query = addBarangayFilter(query);
        const { data, error } = await query;

        if (error) throw error;

        let totalIncome = 0;
        let totalExpenses = 0;

        reportData = (data || []).map((f: any) => {
          const amount = parseFloat(f.amount) || 0;
          if (f.type === 'income') totalIncome += amount;
          else totalExpenses += amount;

          return {
            date: f.transaction_date ? new Date(f.transaction_date).toLocaleDateString() : 'N/A',
            description: f.description || 'N/A',
            category: f.category || 'N/A',
            type: f.type === 'income' ? 'Income' : 'Expense',
            amount: `₱${amount.toFixed(2)}`,
            status: f.status || 'N/A',
          };
        });

        // Add summary
        reportData.push({
          date: '',
          description: 'TOTAL INCOME',
          category: '',
          type: '',
          amount: `₱${totalIncome.toFixed(2)}`,
          status: '',
        });
        reportData.push({
          date: '',
          description: 'TOTAL EXPENSES',
          category: '',
          type: '',
          amount: `₱${totalExpenses.toFixed(2)}`,
          status: '',
        });
        reportData.push({
          date: '',
          description: 'NET INCOME',
          category: '',
          type: '',
          amount: `₱${(totalIncome - totalExpenses).toFixed(2)}`,
          status: '',
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    // Format period label
    const periodLabels: Record<string, string> = {
      daily: 'Today',
      weekly: 'Last 7 Days',
      monthly: 'This Month',
      quarterly: 'This Quarter',
      yearly: 'This Year',
      custom: `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`,
    };

    return NextResponse.json({
      report: {
        title: reportTitle,
        barangay: barangayName,
        period: periodLabels[period] || 'This Month',
        generatedAt: new Date().toISOString(),
        generatedBy: userData.name,
        columns,
        data: reportData,
        totalRecords: reportData.length,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating report:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate report', details: message },
      { status: 500 }
    );
  }
}
