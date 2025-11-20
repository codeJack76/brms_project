import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch barangay information
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const barangayId = searchParams.get('id');
    const email = searchParams.get('email');

    if (barangayId) {
      // Fetch specific barangay by ID
      console.log('GET /api/barangays - Fetching by ID:', barangayId);
      const { data, error } = await supabase
        .from('barangays')
        .select('*')
        .eq('id', barangayId)
        .single();
      
      if (error) {
        console.error('Error fetching barangay by ID:', error);
        return NextResponse.json({ error: 'Barangay not found' }, { status: 404 });
      }

      console.log('Barangay found by ID:', data);
      return NextResponse.json({ barangay: data });
    } else if (email) {
      // Fetch barangay by email
      console.log('GET /api/barangays - Fetching by email:', email);
      const { data, error } = await supabase
        .from('barangays')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        console.log('No barangay found for email:', email, error);
        return NextResponse.json({ barangay: null });
      }

      console.log('Barangay found by email:', data);
      return NextResponse.json({ barangay: data });
    } else {
      // Fetch all barangays
      console.log('GET /api/barangays - Fetching all');
      const { data, error } = await supabase
        .from('barangays')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching barangays:', error);
        return NextResponse.json({ error: 'Failed to fetch barangays' }, { status: 500 });
      }

      return NextResponse.json({ barangays: data || [] });
    }
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new barangay
export async function POST(request: NextRequest) {
  try {
    const cookieStore = request.cookies;
    const userRole = cookieStore.get('user_role')?.value;
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userRole || !['superadmin', 'barangay_captain'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, address, contact_number, email } = body;

    console.log('POST /api/barangays - Received:', { name, address, contact_number, email });
    console.log('User email from cookie:', userEmail);

    if (!name) {
      return NextResponse.json(
        { error: 'Barangay name is required' }, 
        { status: 400 }
      );
    }

    // Use provided email or fallback to user's email from cookie
    const barangayEmail = email || userEmail;
    console.log('Final barangay email:', barangayEmail);

    const { data, error } = await supabase
      .from('barangays')
      .insert({
        name,
        address: address || null,
        contact_number: contact_number || null,
        email: barangayEmail || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Create error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // IMPORTANT: Update the user's barangay_id if they're a barangay captain
    if (userRole === 'barangay_captain' && userEmail && data?.id) {
      console.log('Updating user barangay_id for:', userEmail, 'to:', data.id);
      const { error: updateError } = await supabase
        .from('users')
        .update({ barangay_id: data.id })
        .eq('email', userEmail);

      if (updateError) {
        console.error('Error updating user barangay_id:', updateError);
        // Don't fail the request, but log the error
      } else {
        console.log('✅ Successfully linked captain to barangay');
      }
    }

    return NextResponse.json({ success: true, barangay: data });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update barangay
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = request.cookies;
    const userRole = cookieStore.get('user_role')?.value;
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userRole || !['superadmin', 'barangay_captain', 'secretary'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, address, contact_number, email } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and barangay name are required' },
        { status: 400 }
      );
    }

    // Verify ownership for non-superadmin
    if (userRole !== 'superadmin') {
      const { data: user } = await supabase
        .from('users')
        .select('barangay_id')
        .eq('email', userEmail)
        .single();

      if (!user || user.barangay_id !== id) {
        return NextResponse.json({ error: 'Unauthorized to update this barangay' }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('barangays')
      .update({
        name,
        address: address || null,
        contact_number: contact_number || null,
        email: email || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, barangay: data });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
