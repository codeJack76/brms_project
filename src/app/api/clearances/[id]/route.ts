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

// GET /api/clearances/[id] - Fetch a single clearance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: clearance, error } = await supabaseAdmin
      .from('clearances')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Transform snake_case to camelCase
    const transformedClearance = {
      id: clearance.id,
      documentNumber: clearance.document_number,
      residentId: clearance.resident_id,
      residentName: clearance.resident_name,
      purpose: clearance.purpose,
      validityPeriod: clearance.validity_period,
      issueDate: clearance.issue_date,
      expiryDate: clearance.expiry_date,
      status: clearance.status,
      requestedDate: clearance.requested_date,
      requestDate: clearance.request_date,
      approvedDate: clearance.approved_date,
      approvedBy: clearance.approved_by,
      issuedBy: clearance.issued_by,
      processedBy: clearance.processed_by,
      feeAmount: clearance.fee_amount,
      orNumber: clearance.or_number,
      paymentDate: clearance.payment_date,
      paymentStatus: clearance.payment_status,
      remarks: clearance.remarks,
      clearanceType: clearance.clearance_type,
      cedulaNumber: clearance.cedula_number,
      cedulaDate: clearance.cedula_date,
      cedulaPlace: clearance.cedula_place,
      hasPendingCase: clearance.has_pending_case,
      caseDetails: clearance.case_details,
      clearanceStatus: clearance.clearance_status,
      verifiedBy: clearance.verified_by,
      verifiedDate: clearance.verified_date,
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

// PUT /api/clearances/[id] - Update a clearance
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (body.resident_id !== undefined) updateData.resident_id = body.resident_id;
    if (body.resident_name !== undefined) updateData.resident_name = body.resident_name;
    if (body.clearance_type !== undefined) updateData.clearance_type = body.clearance_type;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.validity_period !== undefined) updateData.validity_period = body.validity_period;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.approved_date !== undefined) updateData.approved_date = body.approved_date;
    if (body.approved_by !== undefined) updateData.approved_by = body.approved_by;
    if (body.issued_by !== undefined) updateData.issued_by = body.issued_by;
    if (body.processed_by !== undefined) updateData.processed_by = body.processed_by;
    if (body.fee_amount !== undefined) updateData.fee_amount = body.fee_amount;
    if (body.or_number !== undefined) updateData.or_number = body.or_number;
    if (body.payment_date !== undefined) updateData.payment_date = body.payment_date;
    if (body.payment_status !== undefined) updateData.payment_status = body.payment_status;
    if (body.remarks !== undefined) updateData.remarks = body.remarks;
    if (body.cedula_number !== undefined) updateData.cedula_number = body.cedula_number;
    if (body.cedula_date !== undefined) updateData.cedula_date = body.cedula_date;
    if (body.cedula_place !== undefined) updateData.cedula_place = body.cedula_place;
    if (body.has_pending_case !== undefined) updateData.has_pending_case = body.has_pending_case;
    if (body.case_details !== undefined) updateData.case_details = body.case_details;
    if (body.clearance_status !== undefined) updateData.clearance_status = body.clearance_status;
    if (body.verified_by !== undefined) updateData.verified_by = body.verified_by;
    if (body.verified_date !== undefined) updateData.verified_date = body.verified_date;

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
      documentNumber: clearance.document_number,
      residentId: clearance.resident_id,
      residentName: clearance.resident_name,
      purpose: clearance.purpose,
      validityPeriod: clearance.validity_period,
      issueDate: clearance.issue_date,
      expiryDate: clearance.expiry_date,
      status: clearance.status,
      requestedDate: clearance.requested_date,
      requestDate: clearance.request_date,
      approvedDate: clearance.approved_date,
      approvedBy: clearance.approved_by,
      issuedBy: clearance.issued_by,
      processedBy: clearance.processed_by,
      feeAmount: clearance.fee_amount,
      orNumber: clearance.or_number,
      paymentDate: clearance.payment_date,
      paymentStatus: clearance.payment_status,
      remarks: clearance.remarks,
      clearanceType: clearance.clearance_type,
      cedulaNumber: clearance.cedula_number,
      cedulaDate: clearance.cedula_date,
      cedulaPlace: clearance.cedula_place,
      hasPendingCase: clearance.has_pending_case,
      caseDetails: clearance.case_details,
      clearanceStatus: clearance.clearance_status,
      verifiedBy: clearance.verified_by,
      verifiedDate: clearance.verified_date,
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

// DELETE /api/clearances/[id] - Delete a clearance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
