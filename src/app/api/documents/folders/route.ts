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

// GET /api/documents/folders - Get all folders for user's barangay
export async function GET(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);

    if ('error' in userResult) {
      return NextResponse.json(
        { error: userResult.error },
        { status: userResult.status }
      );
    }

    const { userData } = userResult;

    if (!userData.barangay_id && userData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'User is not assigned to a barangay' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('barangay_folders')
      .select('*')
      .order('folder_name', { ascending: true });

    // Filter by barangay unless superadmin
    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data: folders, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get document counts for each folder
    const foldersWithCounts = await Promise.all(
      (folders || []).map(async (folder) => {
        const { count } = await supabaseAdmin
          .from('barangay_documents')
          .select('*', { count: 'exact', head: true })
          .eq('folder_id', folder.id);

        return {
          ...folder,
          document_count: count || 0,
        };
      })
    );

    return NextResponse.json(foldersWithCounts);
  } catch (error: unknown) {
    console.error('Error fetching folders:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch folders', details: message },
      { status: 500 }
    );
  }
}

// POST /api/documents/folders - Create a new folder
export async function POST(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);

    if ('error' in userResult) {
      return NextResponse.json(
        { error: userResult.error },
        { status: userResult.status }
      );
    }

    const { userData } = userResult;
    const body = await request.json();

    if (!userData.barangay_id) {
      return NextResponse.json(
        { error: 'User is not assigned to a barangay' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.folder_name || body.folder_name.trim() === '') {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const folderName = body.folder_name.trim();

    // Check for duplicate folder name
    const { data: existing } = await supabaseAdmin
      .from('barangay_folders')
      .select('id')
      .eq('barangay_id', userData.barangay_id)
      .eq('folder_name', folderName)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A folder with this name already exists' },
        { status: 409 }
      );
    }

    // Create folder
    const { data: folder, error } = await supabaseAdmin
      .from('barangay_folders')
      .insert({
        barangay_id: userData.barangay_id,
        folder_name: folderName,
        created_by: userData.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from('barangay_activity_logs').insert({
      barangay_id: userData.barangay_id,
      action: 'folder_created',
      user_id: userData.id,
      folder_id: folder.id,
      details: { folder_name: folderName },
    });

    return NextResponse.json(
      { ...folder, document_count: 0 },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating folder:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create folder', details: message },
      { status: 500 }
    );
  }
}
