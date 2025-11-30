import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and is superadmin
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;
    const userRole = cookieStore.get('user_role')?.value;

    if (!userEmail || userRole !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized. Superadmin access required.' },
        { status: 403 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get total barangays
    const { count: totalBarangays, error: barangaysError } = await supabase
      .from('barangays')
      .select('*', { count: 'exact', head: true });

    if (barangaysError) {
      console.error('Error fetching barangays:', barangaysError);
    }

    // Get total captains (users with role barangay_captain)
    const { count: totalCaptains, error: captainsError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'barangay_captain');

    if (captainsError) {
      console.error('Error fetching captains:', captainsError);
    }

    // Get active captains (is_active = true)
    const { count: activeCaptains, error: activeCaptainsError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'barangay_captain')
      .eq('is_active', true);

    if (activeCaptainsError) {
      console.error('Error fetching active captains:', activeCaptainsError);
    }

    // Get total users (all roles)
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    // Get total residents (across all barangays)
    const { count: totalResidents, error: residentsError } = await supabase
      .from('residents')
      .select('*', { count: 'exact', head: true });

    if (residentsError) {
      console.error('Error fetching residents:', residentsError);
    }

    // Get barangays that need setup (municipality = 'To be configured')
    const { count: pendingSetup, error: pendingError } = await supabase
      .from('barangays')
      .select('*', { count: 'exact', head: true })
      .eq('municipality', 'To be configured');

    if (pendingError) {
      console.error('Error fetching pending setup:', pendingError);
    }

    return NextResponse.json({
      totalBarangays: totalBarangays || 0,
      totalCaptains: totalCaptains || 0,
      totalUsers: totalUsers || 0,
      totalResidents: totalResidents || 0,
      activeCaptains: activeCaptains || 0,
      pendingSetup: pendingSetup || 0
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
