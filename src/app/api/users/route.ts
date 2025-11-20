import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// GET - Fetch users (with automatic barangay isolation)
export async function GET(request: NextRequest) {
  try {
    // Get user email from cookie for authentication
    const userEmail = request.cookies.get('user_email')?.value;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Get current user's barangay_id and role
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('barangay_id, role')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.error('Error fetching current user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const includeBarangay = searchParams.get('include_barangay') === 'true';
    const captainsOnly = searchParams.get('captains_only') === 'true';

    let query = supabaseAdmin
      .from('users')
      .select(includeBarangay ? `
        id,
        email,
        name,
        role,
        barangay_id,
        is_active,
        metadata,
        created_at,
        barangays (
          id,
          name,
          address,
          email,
          contact_number
        )
      ` : '*');

    // For superadmin: show only barangay captains if captainsOnly flag is set
    // Otherwise, superadmin can see all users
    if (currentUser.role === 'superadmin') {
      if (captainsOnly) {
        query = query.eq('role', 'barangay_captain');
      }
      // Superadmin sees all users (no barangay filter)
    } else {
      // Non-superadmin users can only see users in their barangay
      if (!currentUser.barangay_id) {
        return NextResponse.json(
          { error: 'Your account is not assigned to a barangay' },
          { status: 403 }
        );
      }
      query = query.eq('barangay_id', currentUser.barangay_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      );
    }

    // Define role hierarchy for sorting
    const roleHierarchy: Record<string, number> = {
      'superadmin': 1,
      'barangay_captain': 2,
      'secretary': 3,
      'treasurer': 4,
      'peace_order_officer': 5,
      'health_officer': 6,
      'social_worker': 7,
      'staff': 8,
    };

    // Sort users by role hierarchy, then by name
    const sortedData = (data as any[])?.sort((a: any, b: any) => {
      const roleA = roleHierarchy[a.role] || 999;
      const roleB = roleHierarchy[b.role] || 999;
      
      if (roleA !== roleB) {
        return roleA - roleB;
      }
      
      // If same role, sort alphabetically by name
      return (a.name || a.email).localeCompare(b.name || b.email);
    });

    return NextResponse.json({ users: sortedData || [] });
  } catch (error: any) {
    console.error('GET users error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
