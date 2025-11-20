# Clearances Table Migration Guide

## Overview
This guide explains how to apply the clearances table migration to your Supabase database.

## Migration File
- **File:** `006_update_clearances_table.sql`
- **Purpose:** Updates the clearances table with all necessary columns for the complete clearance management system

## What This Migration Does

### 1. Adds New Columns
- `barangay_id` - Links clearance to specific barangay
- `document_number` - Unique identifier (e.g., BC-2025-0001)
- `resident_name` - Name when resident_id is not available
- `validity_period` - How long the clearance is valid (in days)
- `issue_date` - When clearance was issued
- `expiry_date` - When clearance expires
- `approved_date` - When clearance was approved
- `approved_by` - Who approved it
- `issued_by` - Who issued it
- `fee_amount` - Fee for the clearance
- `or_number` - Official Receipt number
- `payment_date` - When payment was made
- `payment_status` - Payment status (Paid/Unpaid/Partial)
- `remarks` - Additional notes
- `cedula_number` - Community Tax Certificate number
- `cedula_date` - CTC issue date
- `cedula_place` - CTC issue place
- `has_pending_case` - Boolean flag for pending cases
- `case_details` - Details about pending cases
- `clearance_status` - Specific status (Pending/Approved/Released/Rejected)
- `verified_by` - Who verified the clearance
- `verified_date` - When it was verified

### 2. Creates Indexes
Improves query performance for:
- Barangay lookups
- Document number searches
- Resident name searches
- Clearance type filtering
- Status filtering
- Date range queries

### 3. Automatic Document Number Generation
- Function: `generate_clearance_document_number()`
- Trigger: `trigger_auto_generate_document_number`
- Format: `PREFIX-YYYY-NNNN`
- Prefixes:
  - `BC` - Barangay Clearance
  - `CR` - Certificate of Residency
  - `IND` - Indigency Certificate
  - `BUS` - Business Clearance
  - `GM` - Good Moral Certificate
  - `PER` - Permit for Events/Construction

### 4. Row Level Security (RLS)
- Users can only access clearances from their barangay
- Superadmins can access all clearances
- Policies for SELECT, INSERT, UPDATE, DELETE operations

### 5. Creates Views
- `clearances_with_resident` - Combines clearance data with resident and barangay information

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run Migration**
   - Open `006_update_clearances_table.sql`
   - Copy the entire content
   - Paste into the SQL Editor
   - Click "Run" button

4. **Verify Success**
   - Check the output for any errors
   - All statements should execute successfully

### Option 2: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd c:\Users\Acer\Documents\project\brms_project\brms_project

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push
```

### Option 3: Using psql (Direct Database Connection)

```bash
# Get your database connection string from Supabase Dashboard
# Settings -> Database -> Connection String (Direct connection)

psql "postgresql://[YOUR-CONNECTION-STRING]" -f supabase/migrations/006_update_clearances_table.sql
```

## Verification Steps

After running the migration, verify it worked correctly:

### 1. Check Table Structure

```sql
-- View all columns in clearances table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clearances'
ORDER BY ordinal_position;
```

### 2. Test Document Number Generation

```sql
-- Insert a test clearance (replace with actual barangay_id)
INSERT INTO clearances (
  barangay_id,
  clearance_type,
  resident_name,
  purpose,
  fee_amount,
  payment_status,
  status
)
VALUES (
  'your-barangay-uuid-here',
  'Barangay Clearance',
  'Test Resident',
  'Employment',
  50,
  'Unpaid',
  'pending'
)
RETURNING document_number;

-- Should return something like: BC-2025-0001
```

### 3. Check Indexes

```sql
-- List all indexes on clearances table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'clearances';
```

### 4. Verify RLS Policies

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'clearances';
```

### 5. Test the View

```sql
-- Query the clearances view
SELECT *
FROM clearances_with_resident
LIMIT 5;
```

## Rollback (If Needed)

If something goes wrong, you can rollback by:

```sql
-- This will remove all added columns
-- WARNING: This will delete data in these columns!

ALTER TABLE clearances
DROP COLUMN IF EXISTS barangay_id,
DROP COLUMN IF EXISTS document_number,
DROP COLUMN IF EXISTS resident_name,
DROP COLUMN IF EXISTS validity_period,
DROP COLUMN IF EXISTS issue_date,
DROP COLUMN IF EXISTS expiry_date,
DROP COLUMN IF EXISTS approved_date,
DROP COLUMN IF EXISTS approved_by,
DROP COLUMN IF EXISTS issued_by,
DROP COLUMN IF EXISTS fee_amount,
DROP COLUMN IF EXISTS or_number,
DROP COLUMN IF EXISTS payment_date,
DROP COLUMN IF EXISTS payment_status,
DROP COLUMN IF EXISTS remarks,
DROP COLUMN IF EXISTS cedula_number,
DROP COLUMN IF EXISTS cedula_date,
DROP COLUMN IF EXISTS cedula_place,
DROP COLUMN IF EXISTS has_pending_case,
DROP COLUMN IF EXISTS case_details,
DROP COLUMN IF EXISTS clearance_status,
DROP COLUMN IF EXISTS verified_by,
DROP COLUMN IF EXISTS verified_date;

-- Drop the function and trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_document_number ON clearances;
DROP FUNCTION IF EXISTS auto_generate_document_number();
DROP FUNCTION IF EXISTS generate_clearance_document_number(text, uuid);

-- Drop the view
DROP VIEW IF EXISTS clearances_with_resident;
```

## Next Steps

After applying the migration:

1. **Test the Clearances API**
   - The API endpoints should now work correctly
   - Test creating, reading, updating, and deleting clearances

2. **Test the ClearancesPage**
   - Navigate to the Clearances page in your app
   - Try creating a new clearance
   - Verify statistics are displayed correctly
   - Test filtering and searching

3. **Verify Document Number Generation**
   - Create clearances of different types
   - Check that document numbers are unique and follow the pattern

4. **Check Barangay Isolation**
   - Log in as users from different barangays
   - Verify they can only see their barangay's clearances

## Troubleshooting

### Error: "relation clearances_id_seq does not exist"
The clearances table uses UUID for primary keys, not sequences. Remove this line from the migration:
```sql
GRANT USAGE ON SEQUENCE clearances_id_seq TO authenticated;
```

### Error: "column already exists"
The migration uses `ADD COLUMN IF NOT EXISTS`, so this shouldn't happen. If it does, the column was added in a previous run.

### Error: "policy already exists"
The migration drops policies before creating them. If you still get this error, manually drop the conflicting policy:
```sql
DROP POLICY IF EXISTS "policy-name" ON clearances;
```

### RLS Policies Not Working
Make sure your users table has the correct structure and auth.uid() is properly configured:
```sql
-- Check if users have barangay_id
SELECT id, email, barangay_id, role FROM users LIMIT 5;

-- Test auth.uid() function
SELECT auth.uid();
```

## Support

If you encounter issues:
1. Check the error message in the SQL Editor
2. Verify all prerequisite tables exist (users, residents, barangays)
3. Ensure Row Level Security is properly configured
4. Check that your user has sufficient permissions

## Migration Status

- [ ] Migration file created
- [ ] Migration applied to database
- [ ] Table structure verified
- [ ] Indexes created
- [ ] RLS policies working
- [ ] Document number generation tested
- [ ] API endpoints tested
- [ ] Frontend integration tested
