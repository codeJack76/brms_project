-- =====================================================
-- Document Management Module for Barangay Management System
-- Migration: 002_document_management.sql
-- =====================================================

-- Create barangay_folders table
CREATE TABLE IF NOT EXISTS public.barangay_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id UUID NOT NULL REFERENCES public.barangays(id) ON DELETE CASCADE,
    folder_name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique folder names within a barangay
    CONSTRAINT unique_folder_name_per_barangay UNIQUE (barangay_id, folder_name)
);

-- Create barangay_documents table
CREATE TABLE IF NOT EXISTS public.barangay_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id UUID NOT NULL REFERENCES public.barangays(id) ON DELETE CASCADE,
    folder_id UUID NOT NULL REFERENCES public.barangay_folders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    storage_path TEXT NOT NULL, -- Full path in Supabase Storage
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create barangay_activity_logs table
CREATE TABLE IF NOT EXISTS public.barangay_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id UUID NOT NULL REFERENCES public.barangays(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'folder_created', 'folder_renamed', 'folder_deleted', 'document_uploaded', 'document_deleted', 'document_downloaded'
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    folder_id UUID REFERENCES public.barangay_folders(id) ON DELETE SET NULL,
    document_id UUID REFERENCES public.barangay_documents(id) ON DELETE SET NULL,
    details JSONB, -- Additional details about the action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_barangay_folders_barangay_id ON public.barangay_folders(barangay_id);
CREATE INDEX IF NOT EXISTS idx_barangay_documents_barangay_id ON public.barangay_documents(barangay_id);
CREATE INDEX IF NOT EXISTS idx_barangay_documents_folder_id ON public.barangay_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_barangay_activity_logs_barangay_id ON public.barangay_activity_logs(barangay_id);
CREATE INDEX IF NOT EXISTS idx_barangay_activity_logs_user_id ON public.barangay_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_barangay_activity_logs_created_at ON public.barangay_activity_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.barangay_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Row Level Security Policies for barangay_folders
-- =====================================================

-- Policy: Users can only view folders from their own barangay
CREATE POLICY "Users can view folders from their barangay"
ON public.barangay_folders
FOR SELECT
USING (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
);

-- Policy: Users can create folders in their own barangay
CREATE POLICY "Users can create folders in their barangay"
ON public.barangay_folders
FOR INSERT
WITH CHECK (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
);

-- Policy: Users can update folders in their own barangay
CREATE POLICY "Users can update folders in their barangay"
ON public.barangay_folders
FOR UPDATE
USING (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
)
WITH CHECK (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
);

-- Policy: Users can delete folders from their own barangay
CREATE POLICY "Users can delete folders from their barangay"
ON public.barangay_folders
FOR DELETE
USING (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
);

-- =====================================================
-- Row Level Security Policies for barangay_documents
-- =====================================================

-- Policy: Users can only view documents from their own barangay
CREATE POLICY "Users can view documents from their barangay"
ON public.barangay_documents
FOR SELECT
USING (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
);

-- Policy: Users can upload documents to their own barangay
CREATE POLICY "Users can upload documents to their barangay"
ON public.barangay_documents
FOR INSERT
WITH CHECK (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
);

-- Policy: Users can update documents in their own barangay
CREATE POLICY "Users can update documents in their barangay"
ON public.barangay_documents
FOR UPDATE
USING (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
)
WITH CHECK (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
);

-- Policy: Users can delete documents from their own barangay
CREATE POLICY "Users can delete documents from their barangay"
ON public.barangay_documents
FOR DELETE
USING (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
);

-- =====================================================
-- Row Level Security Policies for barangay_activity_logs
-- =====================================================

-- Policy: Users can view activity logs from their own barangay
CREATE POLICY "Users can view activity logs from their barangay"
ON public.barangay_activity_logs
FOR SELECT
USING (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
);

-- Policy: Users can create activity logs for their own barangay
CREATE POLICY "Users can create activity logs for their barangay"
ON public.barangay_activity_logs
FOR INSERT
WITH CHECK (
    barangay_id IN (
        SELECT barangay_id FROM public.users WHERE id = auth.uid()
    )
);

-- =====================================================
-- Trigger for updated_at timestamps
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for barangay_folders
DROP TRIGGER IF EXISTS update_barangay_folders_updated_at ON public.barangay_folders;
CREATE TRIGGER update_barangay_folders_updated_at
    BEFORE UPDATE ON public.barangay_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for barangay_documents
DROP TRIGGER IF EXISTS update_barangay_documents_updated_at ON public.barangay_documents;
CREATE TRIGGER update_barangay_documents_updated_at
    BEFORE UPDATE ON public.barangay_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Storage bucket setup (run this in Supabase Dashboard SQL Editor)
-- =====================================================
-- Note: Storage buckets are typically created via Supabase Dashboard
-- or using the storage-js client. The following is for reference:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', false);
--
-- Storage Policy: Users can only access files in their barangay's folder
-- This should be set up in Supabase Dashboard under Storage > Policies

-- =====================================================
-- Helper function to get document count per folder
-- =====================================================
CREATE OR REPLACE FUNCTION get_folder_document_count(p_folder_id UUID)
RETURNS INTEGER AS $$
DECLARE
    doc_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO doc_count
    FROM public.barangay_documents
    WHERE folder_id = p_folder_id;
    RETURN doc_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- View for folders with document counts
-- =====================================================
CREATE OR REPLACE VIEW public.folders_with_counts AS
SELECT 
    f.id,
    f.barangay_id,
    f.folder_name,
    f.description,
    f.created_by,
    f.created_at,
    f.updated_at,
    COALESCE(COUNT(d.id), 0) as document_count,
    COALESCE(SUM(d.file_size), 0) as total_size
FROM public.barangay_folders f
LEFT JOIN public.barangay_documents d ON f.id = d.folder_id
GROUP BY f.id, f.barangay_id, f.folder_name, f.description, f.created_by, f.created_at, f.updated_at;

-- Grant access to the view
GRANT SELECT ON public.folders_with_counts TO authenticated;

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE public.barangay_folders IS 'Stores folder information for document organization per barangay';
COMMENT ON TABLE public.barangay_documents IS 'Stores document metadata and references to files in Supabase Storage';
COMMENT ON TABLE public.barangay_activity_logs IS 'Audit trail for all document management activities';

COMMENT ON COLUMN public.barangay_documents.storage_path IS 'Full path to file in Supabase Storage: documents/{barangay_id}/{folder_id}/{filename}';
COMMENT ON COLUMN public.barangay_activity_logs.action IS 'Action type: folder_created, folder_renamed, folder_deleted, document_uploaded, document_deleted, document_downloaded';
