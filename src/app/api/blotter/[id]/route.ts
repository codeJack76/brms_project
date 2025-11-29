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

// GET /api/blotter/[id] - Fetch a single blotter record (with barangay verification)
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
      .from('blotter')
      .select('*')
      .eq('id', id);

    // Non-superadmins can only access their barangay's records
    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data: record, error } = await query.single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Transform snake_case to camelCase
    const transformedRecord = {
      id: record.id,
      barangayId: record.barangay_id,
      caseNumber: record.case_number,
      complainant: record.complainant,
      respondent: record.respondent,
      incidentType: record.incident_type,
      incidentDate: record.incident_date,
      location: record.location,
      status: record.status,
      filedDate: record.filed_date,
      assignedTo: record.assigned_to,
      remarks: record.remarks,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };

    return NextResponse.json({ record: transformedRecord });
  } catch (error: any) {
    console.error('Error fetching blotter record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blotter record', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/blotter/[id] - Update a blotter record (with barangay verification)
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

    // First verify the record belongs to user's barangay
    let verifyQuery = supabaseAdmin
      .from('blotter')
      .select('id, barangay_id')
      .eq('id', id);

    if (userData.role !== 'superadmin' && userData.barangay_id) {
      verifyQuery = verifyQuery.eq('barangay_id', userData.barangay_id);
    }

    const { data: existingRecord, error: verifyError } = await verifyQuery.single();

    if (verifyError || !existingRecord) {
      return NextResponse.json({ error: 'Record not found or access denied' }, { status: 404 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (body.complainant !== undefined) updateData.complainant = body.complainant;
    if (body.respondent !== undefined) updateData.respondent = body.respondent;
    if (body.incident_type !== undefined) updateData.incident_type = body.incident_type;
    if (body.incident_date !== undefined) updateData.incident_date = body.incident_date;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.filed_date !== undefined) updateData.filed_date = body.filed_date;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;
    if (body.remarks !== undefined) updateData.remarks = body.remarks;

    const { data: record, error } = await supabaseAdmin
      .from('blotter')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const transformedRecord = {
      id: record.id,
      barangayId: record.barangay_id,
      caseNumber: record.case_number,
      complainant: record.complainant,
      respondent: record.respondent,
      incidentType: record.incident_type,
      incidentDate: record.incident_date,
      location: record.location,
      status: record.status,
      filedDate: record.filed_date,
      assignedTo: record.assigned_to,
      remarks: record.remarks,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };

    return NextResponse.json({ record: transformedRecord });
  } catch (error: any) {
    console.error('Error updating blotter record:', error);
    return NextResponse.json(
      { error: 'Failed to update blotter record', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/blotter/[id] - Delete a blotter record (with barangay verification)
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

    // First verify the record belongs to user's barangay
    let verifyQuery = supabaseAdmin
      .from('blotter')
      .select('id, barangay_id')
      .eq('id', id);

    if (userData.role !== 'superadmin' && userData.barangay_id) {
      verifyQuery = verifyQuery.eq('barangay_id', userData.barangay_id);
    }

    const { data: existingRecord, error: verifyError } = await verifyQuery.single();

    if (verifyError || !existingRecord) {
      return NextResponse.json({ error: 'Record not found or access denied' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('blotter')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Blotter record deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blotter record:', error);
    return NextResponse.json(
      { error: 'Failed to delete blotter record', details: error.message },
      { status: 500 }
    );
  }
}
