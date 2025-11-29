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

// GET /api/documents/folders/[id] - Get a single folder with documents
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

    // Fetch the folder
    let query = supabaseAdmin
      .from('barangay_folders')
      .select('*')
      .eq('id', id);

    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data: folder, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get document count
    const { count } = await supabaseAdmin
      .from('barangay_documents')
      .select('*', { count: 'exact', head: true })
      .eq('folder_id', id);

    return NextResponse.json({ ...folder, document_count: count || 0 });
  } catch (error: unknown) {
    console.error('Error fetching folder:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch folder', details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/documents/folders/[id] - Rename a folder
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

    if (!userData.barangay_id && userData.role !== 'superadmin') {
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

    const newName = body.folder_name.trim();

    // Check folder exists and belongs to user's barangay
    const { data: existingFolder } = await supabaseAdmin
      .from('barangay_folders')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    if (
      userData.role !== 'superadmin' &&
      existingFolder.barangay_id !== userData.barangay_id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check for duplicate folder name
    const { data: duplicate } = await supabaseAdmin
      .from('barangay_folders')
      .select('id')
      .eq('barangay_id', existingFolder.barangay_id)
      .eq('folder_name', newName)
      .neq('id', id)
      .single();

    if (duplicate) {
      return NextResponse.json(
        { error: 'A folder with this name already exists' },
        { status: 409 }
      );
    }

    // Update folder
    const { data: folder, error } = await supabaseAdmin
      .from('barangay_folders')
      .update({ folder_name: newName })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from('barangay_activity_logs').insert({
      barangay_id: existingFolder.barangay_id,
      action: 'folder_renamed',
      user_id: userData.id,
      folder_id: id,
      details: {
        old_name: existingFolder.folder_name,
        new_name: newName,
      },
    });

    return NextResponse.json(folder);
  } catch (error: unknown) {
    console.error('Error renaming folder:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to rename folder', details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/folders/[id] - Delete a folder and all its documents
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

    // Check folder exists and belongs to user's barangay
    const { data: folder } = await supabaseAdmin
      .from('barangay_folders')
      .select('*')
      .eq('id', id)
      .single();

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    if (
      userData.role !== 'superadmin' &&
      folder.barangay_id !== userData.barangay_id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all documents in the folder to delete from storage
    const { data: documents } = await supabaseAdmin
      .from('barangay_documents')
      .select('id, file_url')
      .eq('folder_id', id);

    // Delete files from storage
    if (documents && documents.length > 0) {
      const filePaths: string[] = [];
      
      for (const doc of documents) {
        try {
          const url = new URL(doc.file_url);
          const pathMatch = url.pathname.match(
            /\/storage\/v1\/object\/public\/[^/]+\/(.+)/
          );
          if (pathMatch && pathMatch[1]) {
            filePaths.push(decodeURIComponent(pathMatch[1]));
          }
        } catch {
          console.error('Failed to parse file URL:', doc.file_url);
        }
      }

      if (filePaths.length > 0) {
        const { error: storageError } = await supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .remove(filePaths);

        if (storageError) {
          console.error('Error deleting files from storage:', storageError);
          // Continue with database deletion
        }
      }
    }

    // Delete folder (cascade will delete documents)
    const { error } = await supabaseAdmin
      .from('barangay_folders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from('barangay_activity_logs').insert({
      barangay_id: folder.barangay_id,
      action: 'folder_deleted',
      user_id: userData.id,
      folder_id: id,
      details: {
        folder_name: folder.folder_name,
        documents_deleted: documents?.length || 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting folder:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete folder', details: message },
      { status: 500 }
    );
  }
}
