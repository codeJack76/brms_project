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

// GET /api/blotter - Fetch blotter records filtered by user's barangay
export async function GET(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;

    let query = supabaseAdmin
      .from('blotter')
      .select('*')
      .order('created_at', { ascending: false });

    // Superadmin can see all blotter records, others only see their barangay's records
    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data: records, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform snake_case to camelCase for frontend
    const transformedRecords = records?.map((record: any) => ({
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
    })) || [];

    return NextResponse.json({ records: transformedRecords });
  } catch (error: any) {
    console.error('Error fetching blotter records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blotter records', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/blotter - Create a new blotter record (automatically assigns user's barangay_id)
export async function POST(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;
    const body = await request.json();

    // Validate required fields
    if (!body.complainant || !body.respondent || !body.incident_type) {
      return NextResponse.json(
        { error: 'Missing required fields: complainant, respondent, and incident_type are required' },
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

    // Generate case number unique per barangay
    const year = new Date().getFullYear();
    const { count } = await supabaseAdmin
      .from('blotter')
      .select('*', { count: 'exact', head: true })
      .eq('barangay_id', userData.barangay_id);
    
    const caseNumber = `BLT-${year}-${String((count || 0) + 1).padStart(4, '0')}`;

    const blotterData = {
      barangay_id: userData.barangay_id,
      case_number: caseNumber,
      complainant: body.complainant,
      respondent: body.respondent,
      incident_type: body.incident_type,
      incident_date: body.incident_date || new Date().toISOString().split('T')[0],
      location: body.location || null,
      status: body.status || 'pending',
      filed_date: body.filed_date || new Date().toISOString().split('T')[0],
      assigned_to: body.assigned_to || null,
      remarks: body.remarks || null,
    };

    const { data: record, error } = await supabaseAdmin
      .from('blotter')
      .insert([blotterData])
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

    return NextResponse.json({ record: transformedRecord }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blotter record:', error);
    return NextResponse.json(
      { error: 'Failed to create blotter record', details: error.message },
      { status: 500 }
    );
  }
}
