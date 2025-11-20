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

// GET /api/clearances - Fetch all clearances
export async function GET(request: NextRequest) {
  try {
    const { data: clearances, error } = await supabaseAdmin
      .from('clearances')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform snake_case to camelCase for frontend
    const transformedClearances = clearances?.map((clearance: any) => ({
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

// POST /api/clearances - Create a new clearance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.resident_name || !body.clearance_type) {
      return NextResponse.json(
        { error: 'Missing required fields: resident_name and clearance_type are required' },
        { status: 400 }
      );
    }

    // Get barangay_id from session or use default (you may need to implement proper auth)
    const barangayId = body.barangay_id || '00000000-0000-0000-0000-000000000001';

    const clearanceData = {
      barangay_id: barangayId,
      resident_id: body.resident_id || null,
      resident_name: body.resident_name,
      clearance_type: body.clearance_type,
      purpose: body.purpose || '',
      validity_period: body.validity_period || 6,
      status: body.status || 'Pending',
      requested_date: body.requested_date || new Date().toISOString(),
      request_date: body.request_date || new Date().toISOString(),
      processed_by: body.processed_by || 'System',
      fee_amount: body.fee_amount || 0,
      or_number: body.or_number || null,
      payment_date: body.payment_date || null,
      payment_status: body.payment_status || 'Unpaid',
      remarks: body.remarks || null,
      cedula_number: body.cedula_number || null,
      cedula_date: body.cedula_date || null,
      cedula_place: body.cedula_place || null,
      has_pending_case: body.has_pending_case || false,
      case_details: body.case_details || null,
      clearance_status: body.clearance_status || 'Pending',
      verified_by: body.verified_by || null,
      verified_date: body.verified_date || null,
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

    return NextResponse.json(transformedClearance, { status: 201 });
  } catch (error: any) {
    console.error('Error creating clearance:', error);
    return NextResponse.json(
      { error: 'Failed to create clearance', details: error.message },
      { status: 500 }
    );
  }
}
