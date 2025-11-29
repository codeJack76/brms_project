import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  return { userData };
}

// GET /api/clearances/stats - Get clearance statistics filtered by user's barangay
export async function GET(request: NextRequest) {
  try {
    // Get user's barangay
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json(
        { error: userResult.error },
        { status: userResult.status }
      );
    }

    const { userData } = userResult;

    // Build query with barangay filter
    let query = supabaseAdmin
      .from('clearances')
      .select('status, clearance_fee_paid, amount_paid, request_paid, type_of_clearance');

    // Superadmin can see all clearances, others only see their barangay's clearances
    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data: clearances, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate statistics based on actual database schema
    const statistics = {
      totalClearances: clearances?.length || 0,
      totalPending: clearances?.filter((c: any) => c.status === 'Pending').length || 0,
      totalApproved: clearances?.filter((c: any) => c.status === 'Approved').length || 0,
      totalReleased: clearances?.filter((c: any) => c.status === 'Released').length || 0,
      totalPaid: clearances?.filter((c: any) => c.clearance_fee_paid === true).length || 0,
      totalUnpaid: clearances?.filter((c: any) => c.clearance_fee_paid === false).length || 0,
      totalRevenue: clearances?.reduce((sum: number, c: any) => {
        if (c.clearance_fee_paid === true) {
          return sum + (parseFloat(c.amount_paid) || 0);
        }
        return sum;
      }, 0) || 0,
      // Breakdown by clearance type (matching database values)
      byType: {
        barangayClearance: clearances?.filter((c: any) => c.type_of_clearance === 'Barangay Clearance').length || 0,
        businessClearance: clearances?.filter((c: any) => c.type_of_clearance === 'Barangay Business Clearance').length || 0,
        residencyCertificate: clearances?.filter((c: any) => c.type_of_clearance === 'Barangay Certificate of Residency').length || 0,
        indigencyCertificate: clearances?.filter((c: any) => c.type_of_clearance === 'Barangay Indigency').length || 0,
      },
    };

    return NextResponse.json({ statistics });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}
