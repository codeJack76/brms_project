import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STORAGE_BUCKET = 'documents';

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

// GET /api/documents - Get all documents with optional filters
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
    const { searchParams } = new URL(request.url);

    if (!userData.barangay_id && userData.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'User is not assigned to a barangay' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('barangay_documents')
      .select('*');

    // Filter by barangay unless superadmin
    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    // Apply optional filters
    const folderId = searchParams.get('folder_id');
    if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    const fileType = searchParams.get('file_type');
    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    const search = searchParams.get('search');
    if (search) {
      query = query.ilike('file_name', `%${search}%`);
    }

    const dateFrom = searchParams.get('date_from');
    if (dateFrom) {
      query = query.gte('uploaded_at', dateFrom);
    }

    const dateTo = searchParams.get('date_to');
    if (dateTo) {
      query = query.lte('uploaded_at', dateTo);
    }

    // Sorting
    const sortField = searchParams.get('sort_by') || 'uploaded_at';
    const sortDir = searchParams.get('sort_dir') || 'desc';
    query = query.order(sortField, { ascending: sortDir === 'asc' });

    const { data: documents, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(documents || []);
  } catch (error: unknown) {
    console.error('Error fetching documents:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: message },
      { status: 500 }
    );
  }
}

// POST /api/documents - Upload a new document
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

    if (!userData.barangay_id) {
      return NextResponse.json(
        { error: 'User is not assigned to a barangay' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderId = formData.get('folder_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!folderId) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      );
    }

    // Verify folder exists and belongs to user's barangay
    const { data: folder, error: folderError } = await supabaseAdmin
      .from('barangay_folders')
      .select('id, barangay_id')
      .eq('id', folderId)
      .single();

    if (folderError || !folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    if (
      userData.role !== 'superadmin' &&
      folder.barangay_id !== userData.barangay_id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${userData.barangay_id}/${folderId}/${timestamp}_${sanitizedName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    // Create document record
    const { data: document, error: dbError } = await supabaseAdmin
      .from('barangay_documents')
      .insert({
        barangay_id: userData.barangay_id,
        folder_id: folderId,
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        uploaded_by: userData.id,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up storage if database insert fails
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([storagePath]);
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      );
    }

    // Log activity
    await supabaseAdmin.from('barangay_activity_logs').insert({
      barangay_id: userData.barangay_id,
      action: 'document_uploaded',
      user_id: userData.id,
      document_id: document.id,
      folder_id: folderId,
      details: {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error: unknown) {
    console.error('Error uploading document:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to upload document', details: message },
      { status: 500 }
    );
  }
}
