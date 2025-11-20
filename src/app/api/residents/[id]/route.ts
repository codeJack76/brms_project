import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// GET - Fetch a single resident by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('residents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching resident:', error);
      return NextResponse.json(
        { error: 'Failed to fetch resident', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Resident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ resident: data });
  } catch (error: any) {
    console.error('GET resident error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a resident by ID (with barangay validation)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      first_name,
      middle_name,
      last_name,
      suffix,
      gender,
      birth_date,
      civil_status,
      nationality,
      occupation,
      email,
      mobile,
      address,
      purok,
      is_active
    } = body;

    // Get user email from cookie
    const userEmail = request.cookies.get('user_email')?.value;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Get user's barangay_id and role
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('barangay_id, role')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: 500 }
      );
    }

    // Check if resident exists and belongs to user's barangay
    const { data: existingResident, error: fetchError } = await supabaseAdmin
      .from('residents')
      .select('barangay_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingResident) {
      return NextResponse.json(
        { error: 'Resident not found' },
        { status: 404 }
      );
    }

    // Only superadmin can update residents from other barangays
    if (userData.role !== 'superadmin' && existingResident.barangay_id !== userData.barangay_id) {
      return NextResponse.json(
        { error: 'You can only update residents in your barangay' },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('residents')
      .update({
        // barangay_id stays the same
        first_name,
        middle_name,
        last_name,
        suffix,
        gender,
        birth_date,
        civil_status,
        nationality,
        occupation,
        email,
        mobile,
        address,
        purok,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating resident:', error);
      return NextResponse.json(
        { error: 'Failed to update resident', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ resident: data });
  } catch (error: any) {
    console.error('PUT resident error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a resident by ID (with barangay validation)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user email from cookie
    const userEmail = request.cookies.get('user_email')?.value;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Get user's barangay_id and role
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('barangay_id, role')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: 500 }
      );
    }

    // Check if resident exists and belongs to user's barangay
    const { data: existingResident, error: fetchError } = await supabaseAdmin
      .from('residents')
      .select('barangay_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingResident) {
      return NextResponse.json(
        { error: 'Resident not found' },
        { status: 404 }
      );
    }

    // Only superadmin can delete residents from other barangays
    if (userData.role !== 'superadmin' && existingResident.barangay_id !== userData.barangay_id) {
      return NextResponse.json(
        { error: 'You can only delete residents in your barangay' },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from('residents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting resident:', error);
      return NextResponse.json(
        { error: 'Failed to delete resident', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Resident deleted successfully' });
  } catch (error: any) {
    console.error('DELETE resident error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
