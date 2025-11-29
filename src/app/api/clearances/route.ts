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

// GET /api/clearances - Fetch clearances filtered by user's barangay
export async function GET(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;

    let query = supabaseAdmin
      .from('clearances')
      .select('*')
      .order('created_at', { ascending: false });

    // Superadmin can see all clearances, others only see their barangay's clearances
    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data: clearances, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform snake_case to camelCase for frontend
    const transformedClearances = clearances?.map((clearance: any) => ({
      id: clearance.id,
      barangayId: clearance.barangay_id,
      clearanceNumber: clearance.clearance_number,
      residentId: clearance.resident_id,
      residentName: clearance.resident_name,
      typeOfClearance: clearance.type_of_clearance,
      purposeOfClearance: clearance.purpose_of_clearance,
      dateRequested: clearance.date_requested,
      dateApproved: clearance.date_approved,
      dateReleased: clearance.date_released,
      status: clearance.status,
      processingOfficer: clearance.processing_officer,
      clearanceFeePaid: clearance.clearance_fee_paid,
      amountPaid: clearance.amount_paid,
      requestPaid: clearance.request_paid,
      cedulaNumber: clearance.cedula_number,
      remarks: clearance.remarks,
      createdAt: clearance.created_at,
      updatedAt: clearance.updated_at,
    })) || [];

    return NextResponse.json(transformedClearances);
  } catch (error: any) {
    console.error('Error fetching clearances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clearances', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/clearances - Create a new clearance (automatically assigns user's barangay_id)
export async function POST(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;
    const body = await request.json();

    // Validate required fields
    if (!body.resident_name || !body.type_of_clearance) {
      return NextResponse.json(
        { error: 'Missing required fields: resident_name and type_of_clearance are required' },
        { status: 400 }
      );
    }

    // Use user's barangay_id (required for data isolation)
    if (!userData.barangay_id) {
      return NextResponse.json(
        { error: 'User is not assigned to a barangay' },
        { status: 400 }
      );
    }

    const clearanceData = {
      barangay_id: userData.barangay_id,
      resident_id: body.resident_id || null,
      resident_name: body.resident_name,
      type_of_clearance: body.type_of_clearance,
      purpose_of_clearance: body.purpose_of_clearance || '',
      status: body.status || 'Pending',
      processing_officer: body.processing_officer || null,
      clearance_fee_paid: body.clearance_fee_paid || false,
      amount_paid: body.amount_paid || 0,
      request_paid: body.request_paid || false,
      cedula_number: body.cedula_number || null,
      remarks: body.remarks || null,
    };

    const { data: clearance, error } = await supabaseAdmin
      .from('clearances')
      .insert([clearanceData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response to camelCase
    const transformedClearance = {
      id: clearance.id,
      barangayId: clearance.barangay_id,
      clearanceNumber: clearance.clearance_number,
      residentId: clearance.resident_id,
      residentName: clearance.resident_name,
      typeOfClearance: clearance.type_of_clearance,
      purposeOfClearance: clearance.purpose_of_clearance,
      dateRequested: clearance.date_requested,
      dateApproved: clearance.date_approved,
      dateReleased: clearance.date_released,
      status: clearance.status,
      processingOfficer: clearance.processing_officer,
      clearanceFeePaid: clearance.clearance_fee_paid,
      amountPaid: clearance.amount_paid,
      requestPaid: clearance.request_paid,
      cedulaNumber: clearance.cedula_number,
      remarks: clearance.remarks,
      createdAt: clearance.created_at,
      updatedAt: clearance.updated_at,
    };

    return NextResponse.json(transformedClearance, { status: 201 });
  } catch (error: any) {
    console.error('Error creating clearance:', error);
    return NextResponse.json(
      { error: 'Failed to create clearance', details: error.message },
      { status: 500 }
    );
  }
}
