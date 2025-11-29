// Document Management Service Functions
// Server-side functions for folder and document operations

import { supabaseAdmin, type Database } from '@/lib/supabase/server';
import type {
  BarangayFolder,
  BarangayDocument,
  BarangayActivityLog,
  ActivityAction,
  FolderWithDocumentCount,
  DocumentFilters,
  DocumentSort,
} from '@/components/documents/types';

const STORAGE_BUCKET = 'documents';

// Database table types for explicit casting
type DbFolder = Database['public']['Tables']['barangay_folders']['Row'];
type DbFolderInsert = Database['public']['Tables']['barangay_folders']['Insert'];
type DbFolderUpdate = Database['public']['Tables']['barangay_folders']['Update'];
type DbDocument = Database['public']['Tables']['barangay_documents']['Row'];
type DbDocumentInsert = Database['public']['Tables']['barangay_documents']['Insert'];
type DbActivityLogInsert = Database['public']['Tables']['barangay_activity_logs']['Insert'];

// ========================
// FOLDER OPERATIONS
// ========================

/**
 * Get all folders for a barangay with document counts
 */
export async function getFolders(barangayId: string): Promise<FolderWithDocumentCount[]> {
  // Get folders
  const { data: folders, error: foldersError } = await supabaseAdmin
    .from('barangay_folders')
    .select('*')
    .eq('barangay_id', barangayId)
    .order('folder_name', { ascending: true })
    .returns<DbFolder[]>();

  if (foldersError) {
    console.error('Error fetching folders:', foldersError);
    throw new Error('Failed to fetch folders');
  }

  // Get document counts for each folder
  const foldersWithCounts: FolderWithDocumentCount[] = await Promise.all(
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

  return foldersWithCounts;
}

/**
 * Get a single folder by ID
 */
export async function getFolder(folderId: string): Promise<BarangayFolder | null> {
  const { data, error } = await supabaseAdmin
    .from('barangay_folders')
    .select('*')
    .eq('id', folderId)
    .single<DbFolder>();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching folder:', error);
    throw new Error('Failed to fetch folder');
  }

  return data;
}

/**
 * Create a new folder
 */
export async function createFolder(
  barangayId: string,
  folderName: string,
  userId: string
): Promise<BarangayFolder> {
  // Check for duplicate folder name
  const { data: existing } = await supabaseAdmin
    .from('barangay_folders')
    .select('id')
    .eq('barangay_id', barangayId)
    .eq('folder_name', folderName)
    .single<{ id: string }>();

  if (existing) {
    throw new Error('A folder with this name already exists');
  }

  const { data, error } = await supabaseAdmin
    .from('barangay_folders')
    .insert({
      barangay_id: barangayId,
      folder_name: folderName,
      created_by: userId,
    } as unknown as never)
    .select()
    .single<DbFolder>();

  if (error) {
    console.error('Error creating folder:', error);
    throw new Error('Failed to create folder');
  }

  // Log activity
  await logActivity(barangayId, 'folder_created', userId, {
    folder_id: data.id,
    details: { folder_name: folderName },
  });

  return data;
}

/**
 * Rename a folder
 */
export async function renameFolder(
  folderId: string,
  newName: string,
  barangayId: string,
  userId: string
): Promise<BarangayFolder> {
  // Check for duplicate folder name
  const { data: existing } = await supabaseAdmin
    .from('barangay_folders')
    .select('id')
    .eq('barangay_id', barangayId)
    .eq('folder_name', newName)
    .neq('id', folderId)
    .single<{ id: string }>();

  if (existing) {
    throw new Error('A folder with this name already exists');
  }

  const { data: oldFolder } = await supabaseAdmin
    .from('barangay_folders')
    .select('folder_name')
    .eq('id', folderId)
    .single<{ folder_name: string }>();

  const { data, error } = await supabaseAdmin
    .from('barangay_folders')
    .update({ folder_name: newName } as unknown as never)
    .eq('id', folderId)
    .select()
    .single<DbFolder>();

  if (error) {
    console.error('Error renaming folder:', error);
    throw new Error('Failed to rename folder');
  }

  // Log activity
  await logActivity(barangayId, 'folder_renamed', userId, {
    folder_id: folderId,
    details: {
      old_name: oldFolder?.folder_name,
      new_name: newName,
    },
  });

  return data;
}

/**
 * Delete a folder and all its documents
 */
export async function deleteFolder(
  folderId: string,
  barangayId: string,
  userId: string
): Promise<void> {
  // Get folder info for logging
  const { data: folder } = await supabaseAdmin
    .from('barangay_folders')
    .select('folder_name')
    .eq('id', folderId)
    .single<{ folder_name: string }>();

  // Get all documents in the folder to delete from storage
  const { data: documents } = await supabaseAdmin
    .from('barangay_documents')
    .select('id, file_url')
    .eq('folder_id', folderId)
    .returns<{ id: string; file_url: string }[]>();

  // Delete files from storage
  if (documents && documents.length > 0) {
    const filePaths = documents.map((doc) => {
      // Extract path from URL
      const url = new URL(doc.file_url);
      const pathParts = url.pathname.split('/storage/v1/object/public/');
      if (pathParts.length > 1) {
        const [, path] = pathParts[1].split('/');
        return path;
      }
      return `${barangayId}/${folderId}/${doc.id}`;
    });

    const { error: storageError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove(filePaths);

    if (storageError) {
      console.error('Error deleting files from storage:', storageError);
      // Continue with database deletion even if storage fails
    }
  }

  // Delete folder (cascade will delete documents)
  const { error } = await supabaseAdmin
    .from('barangay_folders')
    .delete()
    .eq('id', folderId);

  if (error) {
    console.error('Error deleting folder:', error);
    throw new Error('Failed to delete folder');
  }

  // Log activity
  await logActivity(barangayId, 'folder_deleted', userId, {
    folder_id: folderId,
    details: {
      folder_name: folder?.folder_name,
      documents_deleted: documents?.length || 0,
    },
  });
}

// ========================
// DOCUMENT OPERATIONS
// ========================

/**
 * Get documents in a folder with optional filters
 */
export async function getDocuments(
  barangayId: string,
  filters?: DocumentFilters,
  sort?: DocumentSort
): Promise<BarangayDocument[]> {
  let query = supabaseAdmin
    .from('barangay_documents')
    .select('*')
    .eq('barangay_id', barangayId);

  // Apply filters
  if (filters?.folder_id) {
    query = query.eq('folder_id', filters.folder_id);
  }

  if (filters?.file_type) {
    query = query.eq('file_type', filters.file_type);
  }

  if (filters?.search) {
    query = query.ilike('file_name', `%${filters.search}%`);
  }

  if (filters?.date_from) {
    query = query.gte('uploaded_at', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('uploaded_at', filters.date_to);
  }

  // Apply sorting
  const sortField = sort?.field || 'uploaded_at';
  const sortDirection = sort?.direction === 'asc';
  query = query.order(sortField, { ascending: sortDirection });

  const { data, error } = await query.returns<DbDocument[]>();

  if (error) {
    console.error('Error fetching documents:', error);
    throw new Error('Failed to fetch documents');
  }

  return data || [];
}

/**
 * Get a single document by ID
 */
export async function getDocument(documentId: string): Promise<BarangayDocument | null> {
  const { data, error } = await supabaseAdmin
    .from('barangay_documents')
    .select('*')
    .eq('id', documentId)
    .single<DbDocument>();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching document:', error);
    throw new Error('Failed to fetch document');
  }

  return data;
}

/**
 * Upload a document to a folder
 */
export async function uploadDocument(
  barangayId: string,
  folderId: string,
  file: {
    name: string;
    type: string;
    size: number;
    buffer: Buffer | ArrayBuffer;
  },
  userId: string
): Promise<BarangayDocument> {
  // Generate unique file name
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${barangayId}/${folderId}/${timestamp}_${sanitizedName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw new Error('Failed to upload file');
  }

  // Get public URL
  const { data: publicUrlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  // Create document record
  const { data, error } = await supabaseAdmin
    .from('barangay_documents')
    .insert({
      barangay_id: barangayId,
      folder_id: folderId,
      file_name: file.name,
      file_url: publicUrlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: userId,
    } as unknown as never)
    .select()
    .single<DbDocument>();

  if (error) {
    // If DB insert fails, try to clean up storage
    await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([storagePath]);
    console.error('Error creating document record:', error);
    throw new Error('Failed to create document record');
  }

  // Log activity
  await logActivity(barangayId, 'document_uploaded', userId, {
    document_id: data.id,
    folder_id: folderId,
    details: {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    },
  });

  return data;
}

/**
 * Delete a document
 */
export async function deleteDocument(
  documentId: string,
  barangayId: string,
  userId: string
): Promise<void> {
  // Get document info
  const { data: document } = await supabaseAdmin
    .from('barangay_documents')
    .select('*')
    .eq('id', documentId)
    .single<DbDocument>();

  if (!document) {
    throw new Error('Document not found');
  }

  // Extract storage path from URL
  const url = new URL(document.file_url);
  const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
  const storagePath = pathMatch ? pathMatch[1] : null;

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
  const { error } = await supabaseAdmin
    .from('barangay_documents')
    .delete()
    .eq('id', documentId);

  if (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }

  // Log activity
  await logActivity(barangayId, 'document_deleted', userId, {
    document_id: documentId,
    folder_id: document.folder_id,
    details: {
      file_name: document.file_name,
    },
  });
}

/**
 * Log document view activity
 */
export async function logDocumentView(
  documentId: string,
  barangayId: string,
  userId: string
): Promise<void> {
  const { data: document } = await supabaseAdmin
    .from('barangay_documents')
    .select('file_name, folder_id')
    .eq('id', documentId)
    .single<{ file_name: string; folder_id: string }>();

  await logActivity(barangayId, 'document_viewed', userId, {
    document_id: documentId,
    folder_id: document?.folder_id,
    details: {
      file_name: document?.file_name,
    },
  });
}

/**
 * Log document download activity
 */
export async function logDocumentDownload(
  documentId: string,
  barangayId: string,
  userId: string
): Promise<void> {
  const { data: document } = await supabaseAdmin
    .from('barangay_documents')
    .select('file_name, folder_id')
    .eq('id', documentId)
    .single<{ file_name: string; folder_id: string }>();

  await logActivity(barangayId, 'document_downloaded', userId, {
    document_id: documentId,
    folder_id: document?.folder_id,
    details: {
      file_name: document?.file_name,
    },
  });
}

// ========================
// ACTIVITY LOG OPERATIONS
// ========================

/**
 * Log an activity
 */
async function logActivity(
  barangayId: string,
  action: ActivityAction,
  userId: string,
  options?: {
    document_id?: string;
    folder_id?: string;
    details?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await supabaseAdmin.from('barangay_activity_logs').insert({
      barangay_id: barangayId,
      action,
      user_id: userId,
      document_id: options?.document_id || null,
      folder_id: options?.folder_id || null,
      details: options?.details || null,
    } as unknown as never);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging should not break main operations
  }
}

/**
 * Get activity logs for a barangay
 */
export async function getActivityLogs(
  barangayId: string,
  limit: number = 50
): Promise<BarangayActivityLog[]> {
  const { data, error } = await supabaseAdmin
    .from('barangay_activity_logs')
    .select('*')
    .eq('barangay_id', barangayId)
    .order('timestamp', { ascending: false })
    .limit(limit)
    .returns<BarangayActivityLog[]>();

  if (error) {
    console.error('Error fetching activity logs:', error);
    throw new Error('Failed to fetch activity logs');
  }

  return data || [];
}

// ========================
// STORAGE UTILITIES
// ========================

/**
 * Generate a signed URL for private file access
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate download URL');
  }

  return data.signedUrl;
}

/**
 * Get storage stats for a barangay
 */
export async function getStorageStats(barangayId: string): Promise<{
  totalDocuments: number;
  totalFolders: number;
  totalSize: number;
}> {
  const [foldersResult, documentsResult] = await Promise.all([
    supabaseAdmin
      .from('barangay_folders')
      .select('*', { count: 'exact', head: true })
      .eq('barangay_id', barangayId),
    supabaseAdmin
      .from('barangay_documents')
      .select('file_size')
      .eq('barangay_id', barangayId)
      .returns<{ file_size: number | null }[]>(),
  ]);

  const totalSize = (documentsResult.data || []).reduce(
    (sum, doc) => sum + (doc.file_size || 0),
    0
  );

  return {
    totalDocuments: documentsResult.data?.length || 0,
    totalFolders: foldersResult.count || 0,
    totalSize,
  };
}
