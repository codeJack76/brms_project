-- Create clearances table
CREATE TABLE IF NOT EXISTS public.clearances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id UUID NOT NULL,
    clearance_number TEXT UNIQUE, -- Auto-generated clearance number
    
    -- Resident Information
    resident_id UUID REFERENCES public.residents(id) ON DELETE SET NULL,
    resident_name TEXT NOT NULL,
    
    -- Clearance Details
    type_of_clearance TEXT NOT NULL CHECK (type_of_clearance IN (
        'Barangay Clearance',
        'Barangay Certificate of Residency',
        'Barangay Indigency',
        'Barangay Good Moral',
        'Barangay Business Clearance'
    )),
    purpose_of_clearance TEXT NOT NULL, -- Employment, School, Travel, Passport, Loan, Business, etc.
    
    -- Dates
    date_requested TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_approved TIMESTAMP WITH TIME ZONE,
    date_released TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN (
        'Pending',
        'Approved',
        'Released'
    )),
    
    -- Processing Officer
    processing_officer TEXT,
    
    -- Payment Information
    clearance_fee_paid BOOLEAN DEFAULT FALSE, -- Yes/No
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    request_paid BOOLEAN DEFAULT FALSE, -- Yes/No if request is paid
    
    -- Cedula Information
    cedula_number TEXT,
    
    -- Additional Information
    remarks TEXT,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to auto-generate clearance number
CREATE OR REPLACE FUNCTION generate_clearance_number()
RETURNS TRIGGER AS $$
DECLARE
    year_code TEXT;
    sequence_num TEXT;
    new_clearance_number TEXT;
BEGIN
    -- Get current year (last 2 digits)
    year_code := TO_CHAR(CURRENT_DATE, 'YY');
    
    -- Get the next sequence number for this year
    SELECT LPAD(
        (COUNT(*) + 1)::TEXT,
        6,
        '0'
    ) INTO sequence_num
    FROM public.clearances
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND barangay_id = NEW.barangay_id;
    
    -- Format: CLR-YY-XXXXXX (e.g., CLR-25-000001)
    new_clearance_number := 'CLR-' || year_code || '-' || sequence_num;
    
    NEW.clearance_number := new_clearance_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate clearance number
DROP TRIGGER IF EXISTS trigger_generate_clearance_number ON public.clearances;
CREATE TRIGGER trigger_generate_clearance_number
    BEFORE INSERT ON public.clearances
    FOR EACH ROW
    WHEN (NEW.clearance_number IS NULL)
    EXECUTE FUNCTION generate_clearance_number();

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clearances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_clearances_updated_at ON public.clearances;
CREATE TRIGGER trigger_update_clearances_updated_at
    BEFORE UPDATE ON public.clearances
    FOR EACH ROW
    EXECUTE FUNCTION update_clearances_updated_at();

-- Create function to auto-update status dates
CREATE OR REPLACE FUNCTION update_clearance_status_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-set date_approved when status changes to 'Approved'
    IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
        NEW.date_approved := NOW();
    END IF;
    
    -- Auto-set date_released when status changes to 'Released'
    IF NEW.status = 'Released' AND OLD.status != 'Released' THEN
        NEW.date_released := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status date updates
DROP TRIGGER IF EXISTS trigger_update_clearance_status_dates ON public.clearances;
CREATE TRIGGER trigger_update_clearance_status_dates
    BEFORE UPDATE ON public.clearances
    FOR EACH ROW
    EXECUTE FUNCTION update_clearance_status_dates();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clearances_barangay_id ON public.clearances(barangay_id);
CREATE INDEX IF NOT EXISTS idx_clearances_resident_id ON public.clearances(resident_id);
CREATE INDEX IF NOT EXISTS idx_clearances_clearance_number ON public.clearances(clearance_number);
CREATE INDEX IF NOT EXISTS idx_clearances_status ON public.clearances(status);
CREATE INDEX IF NOT EXISTS idx_clearances_type ON public.clearances(type_of_clearance);
CREATE INDEX IF NOT EXISTS idx_clearances_fee_paid ON public.clearances(clearance_fee_paid);
CREATE INDEX IF NOT EXISTS idx_clearances_date_requested ON public.clearances(date_requested DESC);
CREATE INDEX IF NOT EXISTS idx_clearances_resident_name ON public.clearances(resident_name);

-- Enable Row Level Security
ALTER TABLE public.clearances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Allow service role to bypass RLS
CREATE POLICY "Service role can manage all clearances"
    ON public.clearances
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to view all clearances (you can customize this later)
CREATE POLICY "Authenticated users can view clearances"
    ON public.clearances
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert clearances
CREATE POLICY "Authenticated users can insert clearances"
    ON public.clearances
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update clearances
CREATE POLICY "Authenticated users can update clearances"
    ON public.clearances
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to delete clearances
CREATE POLICY "Authenticated users can delete clearances"
    ON public.clearances
    FOR DELETE
    TO authenticated
    USING (true);

-- Create view for clearances with resident details
CREATE OR REPLACE VIEW public.clearances_with_resident AS
SELECT 
    c.id,
    c.barangay_id,
    c.clearance_number,
    c.resident_id,
    c.resident_name,
    c.type_of_clearance,
    c.purpose_of_clearance,
    c.date_requested,
    c.date_approved,
    c.date_released,
    c.status,
    c.processing_officer,
    c.clearance_fee_paid,
    c.amount_paid,
    c.request_paid,
    c.cedula_number,
    c.remarks,
    c.created_at,
    c.updated_at,
    r.first_name,
    r.middle_name,
    r.last_name,
    r.suffix,
    r.date_of_birth,
    r.gender,
    r.civil_status,
    r.phone,
    r.mobile,
    r.email,
    r.house_number,
    r.street,
    r.purok,
    r.barangay
FROM public.clearances c
LEFT JOIN public.residents r ON c.resident_id = r.id;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clearances TO authenticated;
GRANT SELECT ON public.clearances_with_resident TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.clearances IS 'Stores barangay clearance records and certificates';
COMMENT ON COLUMN public.clearances.clearance_number IS 'Auto-generated unique clearance number (e.g., CLR-25-000001)';
COMMENT ON COLUMN public.clearances.type_of_clearance IS 'Type of clearance: Barangay Clearance, Certificate of Residency, Indigency, Good Moral, or Business Clearance';
COMMENT ON COLUMN public.clearances.purpose_of_clearance IS 'Purpose: Employment, School, Travel, Passport, Loan, Business, etc.';
COMMENT ON COLUMN public.clearances.status IS 'Current status: Pending, Approved, or Released';
COMMENT ON COLUMN public.clearances.processing_officer IS 'Officer who processed the clearance request';
COMMENT ON COLUMN public.clearances.clearance_fee_paid IS 'Whether the clearance fee has been paid (Yes/No)';
COMMENT ON COLUMN public.clearances.amount_paid IS 'Amount paid for the clearance';
COMMENT ON COLUMN public.clearances.request_paid IS 'Whether the request has been paid';
