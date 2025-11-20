import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// GET - Fetch all residents with automatic barangay filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
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

    let query = supabaseAdmin
      .from('residents')
      .select('*')
      .order('created_at', { ascending: false });

    // Superadmin can see all residents, others only see their barangay's residents
    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching residents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch residents', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ residents: data || [] });
  } catch (error: any) {
    console.error('GET residents error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new resident (automatically assigns user's barangay_id)
export async function POST(request: NextRequest) {
  try {
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
      is_active = true
    } = body;

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Get user email from cookie
    const userEmail = request.cookies.get('user_email')?.value;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Get user's barangay_id
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

    // Superadmin must have a barangay, barangay captain and other roles must have barangay_id
    if (!userData.barangay_id && userData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'User must be assigned to a barangay before adding residents' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('residents')
      .insert([
        {
          barangay_id: userData.barangay_id, // Automatically set from user's barangay
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
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating resident:', error);
      return NextResponse.json(
        { error: 'Failed to create resident', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Resident created: ${first_name} ${last_name} in barangay ${userData.barangay_id}`);
    return NextResponse.json({ resident: data }, { status: 201 });
  } catch (error: any) {
    console.error('POST resident error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update an existing resident (with barangay validation)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
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

    if (!id) {
      return NextResponse.json(
        { error: 'Resident ID is required' },
        { status: 400 }
      );
    }

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
        // barangay_id stays the same - cannot be changed
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

// DELETE - Delete a resident (with barangay validation)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Resident ID is required' },
        { status: 400 }
      );
    }

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
