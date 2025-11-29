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

// GET /api/documents/[id] - Get a single document
export async function GET(
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

    // Log view activity
    await supabaseAdmin.from('barangay_activity_logs').insert({
      barangay_id: document.barangay_id,
      action: 'document_viewed',
      user_id: userData.id,
      document_id: id,
      folder_id: document.folder_id,
      details: {
        file_name: document.file_name,
      },
    });

    return NextResponse.json(document);
  } catch (error: unknown) {
    console.error('Error fetching document:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch document', details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
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

    // Fetch document to get file path
    const { data: document, error: fetchError } = await supabaseAdmin
      .from('barangay_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (
      userData.role !== 'superadmin' &&
      document.barangay_id !== userData.barangay_id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Extract storage path from URL
    let storagePath: string | null = null;
    try {
      const url = new URL(document.file_url);
      const pathMatch = url.pathname.match(
        /\/storage\/v1\/object\/public\/[^/]+\/(.+)/
      );
      if (pathMatch && pathMatch[1]) {
        storagePath = decodeURIComponent(pathMatch[1]);
      }
    } catch {
      console.error('Failed to parse file URL:', document.file_url);
    }

    // Delete from storage
    if (storagePath) {
      const { error: storageError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with database deletion
      }
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('barangay_documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Supabase error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from('barangay_activity_logs').insert({
      barangay_id: document.barangay_id,
      action: 'document_deleted',
      user_id: userData.id,
      document_id: id,
      folder_id: document.folder_id,
      details: {
        file_name: document.file_name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting document:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete document', details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/documents/[id] - Rename a document
export async function PATCH(
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
    const body = await request.json();
    const { file_name } = body;

    if (!file_name || typeof file_name !== 'string' || !file_name.trim()) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    // Fetch the document
    const { data: document, error: fetchError } = await supabaseAdmin
      .from('barangay_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check access
    if (
      userData.role !== 'superadmin' &&
      document.barangay_id !== userData.barangay_id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const oldFileName = document.file_name;
    const newFileName = file_name.trim();

    // Update the document name
    const { data: updatedDocument, error: updateError } = await supabaseAdmin
      .from('barangay_documents')
      .update({ file_name: newFileName })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from('barangay_activity_logs').insert({
      barangay_id: document.barangay_id,
      action: 'document_renamed',
      user_id: userData.id,
      document_id: id,
      folder_id: document.folder_id,
      details: {
        old_name: oldFileName,
        new_name: newFileName,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error: unknown) {
    console.error('Error renaming document:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to rename document', details: message },
      { status: 500 }
    );
  }
}
