import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to get user's barangay_id from cookie
async function getUserBarangay(request: NextRequest) {
  const userEmail = request.cookies.get('user_email')?.value;

  if (!userEmail) {
    return { error: 'Unauthorized - Please log in', status: 401 };
  }

  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, barangay_id, role')
    .eq('email', userEmail)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
    return { error: 'Failed to fetch user information', status: 500 };
  }

  return { userData, userEmail };
}

// POST /api/documents/[id]/download - Log document download and return file URL
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userResult = await getUserBarangay(request);

    if ('error' in userResult) {
      return NextResponse.json(
        { error: userResult.error },
        { status: userResult.status }
      );
    }

    const { userData } = userResult;

    // Fetch the document
    let query = supabaseAdmin
      .from('barangay_documents')
      .select('*')
      .eq('id', id);

    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data: document, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log download activity
    await supabaseAdmin.from('barangay_activity_logs').insert({
      barangay_id: document.barangay_id,
      action: 'document_downloaded',
      user_id: userData.id,
      document_id: id,
      folder_id: document.folder_id,
      details: {
        file_name: document.file_name,
      },
    });

    return NextResponse.json({
      file_url: document.file_url,
      file_name: document.file_name,
    });
  } catch (error: unknown) {
    console.error('Error processing download:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process download', details: message },
      { status: 500 }
    );
  }
}
