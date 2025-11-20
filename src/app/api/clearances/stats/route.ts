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

// GET /api/clearances/stats - Get clearance statistics
export async function GET(request: NextRequest) {
  try {
    const { data: clearances, error } = await supabaseAdmin
      .from('clearances')
      .select('status, payment_status, fee_amount');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate statistics
    const statistics = {
      totalClearances: clearances?.length || 0,
      totalPending: clearances?.filter((c: any) => c.status === 'Pending').length || 0,
      totalApproved: clearances?.filter((c: any) => c.status === 'Approved').length || 0,
      totalIssued: clearances?.filter((c: any) => c.status === 'Issued').length || 0,
      totalRejected: clearances?.filter((c: any) => c.status === 'Rejected').length || 0,
      totalReleased: clearances?.filter((c: any) => c.status === 'Released').length || 0,
      totalRevenue: clearances?.reduce((sum: number, c: any) => {
        if (c.payment_status === 'Paid') {
          return sum + (parseFloat(c.fee_amount) || 0);
        }
        return sum;
      }, 0) || 0,
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
