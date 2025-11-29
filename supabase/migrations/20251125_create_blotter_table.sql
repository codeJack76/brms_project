-- Migration: Create blotter table for barangay blotter records
CREATE TABLE IF NOT EXISTS blotter (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id UUID NOT NULL REFERENCES public.barangays(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    case_number VARCHAR(32) NOT NULL,
    complainant VARCHAR(128) NOT NULL,
    respondent VARCHAR(128) NOT NULL,
    incident_type VARCHAR(64) NOT NULL,
    incident_date DATE NOT NULL,
    location VARCHAR(128),
    status VARCHAR(24) NOT NULL CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    filed_date DATE NOT NULL,
    assigned_to VARCHAR(128),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for barangay_id
CREATE INDEX IF NOT EXISTS idx_blotter_barangay_id ON blotter(barangay_id);

-- Index for faster search by case number
CREATE INDEX IF NOT EXISTS idx_blotter_case_number ON blotter(case_number);

-- Index for status
CREATE INDEX IF NOT EXISTS idx_blotter_status ON blotter(status);

-- Index for incident_date
CREATE INDEX IF NOT EXISTS idx_blotter_incident_date ON blotter(incident_date);
