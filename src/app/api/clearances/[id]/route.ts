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

// GET /api/clearances/[id] - Fetch a single clearance (with barangay verification)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;
    const { id } = await params;

    let query = supabaseAdmin
      .from('clearances')
      .select('*')
      .eq('id', id);

    // Non-superadmins can only access their barangay's clearances
    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data: clearance, error } = await query.single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Transform snake_case to camelCase
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

    return NextResponse.json(transformedClearance);
  } catch (error: any) {
    console.error('Error fetching clearance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clearance', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/clearances/[id] - Update a clearance (with barangay verification)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;
    const { id } = await params;
    const body = await request.json();

    // First verify the clearance belongs to user's barangay
    let verifyQuery = supabaseAdmin
      .from('clearances')
      .select('id, barangay_id')
      .eq('id', id);

    if (userData.role !== 'superadmin' && userData.barangay_id) {
      verifyQuery = verifyQuery.eq('barangay_id', userData.barangay_id);
    }

    const { data: existingClearance, error: verifyError } = await verifyQuery.single();

    if (verifyError || !existingClearance) {
      return NextResponse.json({ error: 'Clearance not found or access denied' }, { status: 404 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (body.resident_id !== undefined) updateData.resident_id = body.resident_id;
    if (body.resident_name !== undefined) updateData.resident_name = body.resident_name;
    if (body.type_of_clearance !== undefined) updateData.type_of_clearance = body.type_of_clearance;
    if (body.purpose_of_clearance !== undefined) updateData.purpose_of_clearance = body.purpose_of_clearance;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.date_approved !== undefined) updateData.date_approved = body.date_approved;
    if (body.date_released !== undefined) updateData.date_released = body.date_released;
    if (body.processing_officer !== undefined) updateData.processing_officer = body.processing_officer;
    if (body.clearance_fee_paid !== undefined) updateData.clearance_fee_paid = body.clearance_fee_paid;
    if (body.amount_paid !== undefined) updateData.amount_paid = body.amount_paid;
    if (body.request_paid !== undefined) updateData.request_paid = body.request_paid;
    if (body.cedula_number !== undefined) updateData.cedula_number = body.cedula_number;
    if (body.remarks !== undefined) updateData.remarks = body.remarks;

    const { data: clearance, error } = await supabaseAdmin
      .from('clearances')
      .update(updateData)
      .eq('id', id)
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

    return NextResponse.json(transformedClearance);
  } catch (error: any) {
    console.error('Error updating clearance:', error);
    return NextResponse.json(
      { error: 'Failed to update clearance', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/clearances/[id] - Delete a clearance (with barangay verification)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;
    const { id } = await params;

    // First verify the clearance belongs to user's barangay
    let verifyQuery = supabaseAdmin
      .from('clearances')
      .select('id, barangay_id')
      .eq('id', id);

    if (userData.role !== 'superadmin' && userData.barangay_id) {
      verifyQuery = verifyQuery.eq('barangay_id', userData.barangay_id);
    }

    const { data: existingClearance, error: verifyError } = await verifyQuery.single();

    if (verifyError || !existingClearance) {
      return NextResponse.json({ error: 'Clearance not found or access denied' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('clearances')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Clearance deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting clearance:', error);
    return NextResponse.json(
      { error: 'Failed to delete clearance', details: error.message },
      { status: 500 }
    );
  }
}
