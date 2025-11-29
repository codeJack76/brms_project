-- Migration: Create financial_transactions table for barangay financial records
-- This table is isolated per barangay using barangay_id foreign key

CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id UUID NOT NULL REFERENCES public.barangays(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    transaction_number VARCHAR(32) NOT NULL,
    type VARCHAR(16) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(64) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    paid_by VARCHAR(128),
    received_by VARCHAR(128),
    reference_number VARCHAR(64),
    status VARCHAR(24) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for barangay_id (critical for multi-tenant filtering)
CREATE INDEX IF NOT EXISTS idx_financial_transactions_barangay_id ON financial_transactions(barangay_id);

-- Index for faster search by transaction number
CREATE INDEX IF NOT EXISTS idx_financial_transactions_number ON financial_transactions(transaction_number);

-- Index for type (income/expense filtering)
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);

-- Index for status
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);

-- Index for transaction_date (for date range queries and reporting)
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);

-- Index for category (for category filtering)
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON financial_transactions(category);

-- Composite index for common queries (barangay + date range)
CREATE INDEX IF NOT EXISTS idx_financial_transactions_barangay_date ON financial_transactions(barangay_id, transaction_date);

-- Trigger to update updated_at on row update
CREATE OR REPLACE FUNCTION update_financial_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_transactions_updated_at();

-- Comments for documentation
COMMENT ON TABLE financial_transactions IS 'Barangay financial transactions - isolated per barangay';
COMMENT ON COLUMN financial_transactions.barangay_id IS 'Foreign key to barangays table for multi-tenant isolation';
COMMENT ON COLUMN financial_transactions.type IS 'Transaction type: income or expense';
COMMENT ON COLUMN financial_transactions.category IS 'Category like Clearance Fee, Permit Fee, Office Supplies, etc.';
COMMENT ON COLUMN financial_transactions.paid_by IS 'Name of person/entity who paid (for income) or vendor (for expense)';
COMMENT ON COLUMN financial_transactions.received_by IS 'Name of barangay official who received/processed the transaction';
