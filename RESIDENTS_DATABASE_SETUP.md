# Database Setup Guide - Residents Table

## Option 1: Using Supabase Dashboard (Recommended for Beginners)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to "SQL Editor" in the left sidebar

2. **Run the Migration**
   - Click "New query"
   - Copy the contents of `supabase/migrations/005_create_residents_table.sql`
   - Paste it into the SQL editor
   - Click "Run" or press Ctrl+Enter

3. **Verify the Table**
   - Go to "Table Editor" in the left sidebar
   - You should see the `residents` table listed
   - Click on it to view the structure

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to your project directory
cd c:\Users\Acer\Documents\project\brms_project\brms_project

# Run the migration
supabase db push

# Or apply specific migration
supabase migration up
```

## Option 3: Using Direct SQL Connection

If you prefer using a SQL client:

```bash
# Get your database connection string from Supabase Dashboard
# Settings > Database > Connection string

# Connect using psql
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration file
\i supabase/migrations/005_create_residents_table.sql
```

## What This Migration Creates

1. **residents table** with the following fields:
   - id (UUID, primary key)
   - barangay_id (UUID, foreign key to barangays)
   - first_name, middle_name, last_name, suffix
   - gender, birth_date, civil_status, nationality
   - occupation, email, mobile
   - address, purok
   - is_active (boolean)
   - created_at, updated_at (timestamps)

2. **Indexes** for better query performance:
   - barangay_id index
   - Name index (last_name, first_name)
   - Mobile and email indexes
   - is_active index

3. **View**: `residents_with_full_name`
   - Combines name parts into full_name
   - Calculates age from birth_date

4. **Row Level Security (RLS) Policies**:
   - Authenticated users can read all residents
   - Authenticated users can insert/update/delete residents
   - (You can customize these policies based on your requirements)

5. **Triggers**:
   - Automatically updates `updated_at` timestamp on any update

## Verify the Setup

After running the migration, verify it worked:

1. **Check Table Exists**
   ```sql
   SELECT * FROM residents LIMIT 1;
   ```

2. **Check View Exists**
   ```sql
   SELECT * FROM residents_with_full_name LIMIT 1;
   ```

3. **Check Indexes**
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'residents';
   ```

4. **Check RLS Policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'residents';
   ```

## Testing the API

Once the table is created, test your resident API endpoints:

### 1. Create a Resident
```bash
POST http://localhost:3000/api/residents
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "middle_name": "Santos",
  "gender": "Male",
  "birth_date": "1990-01-15",
  "civil_status": "Single",
  "nationality": "Filipino",
  "occupation": "Engineer",
  "email": "juan@email.com",
  "mobile": "09171234567",
  "address": "123 Main St",
  "purok": "Purok 1",
  "is_active": true
}
```

### 2. Get All Residents
```bash
GET http://localhost:3000/api/residents
```

### 3. Get Residents by Barangay
```bash
GET http://localhost:3000/api/residents?barangay_id=YOUR_BARANGAY_ID
```

### 4. Update a Resident
```bash
PUT http://localhost:3000/api/residents/RESIDENT_ID
Content-Type: application/json

{
  "first_name": "Juan",
  "occupation": "Senior Engineer"
}
```

### 5. Delete a Resident
```bash
DELETE http://localhost:3000/api/residents/RESIDENT_ID
```

## Troubleshooting

### Error: "relation residents already exists"
- The table already exists. You can skip the migration or drop the table first:
  ```sql
  DROP TABLE IF EXISTS residents CASCADE;
  ```

### Error: "permission denied"
- Make sure you're using the correct database credentials
- Check that your user has CREATE TABLE permissions

### Error: "could not connect to server"
- Verify your internet connection
- Check that your Supabase project is running
- Verify the connection string is correct

## Security Notes

⚠️ **Important**: The current RLS policies allow all authenticated users to read/write residents. 

For production, you may want to restrict access based on user roles:

```sql
-- Example: Only allow admins and staff to manage residents
CREATE POLICY "Only admins can manage residents"
ON residents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'staff')
  )
);
```

## Next Steps

After successfully creating the residents table:

1. ✅ Test the API endpoints
2. ✅ Add some sample data through the UI
3. ✅ Test filtering and sorting
4. ✅ Test CSV export
5. ✅ Customize RLS policies for your security requirements
6. ✅ Add any additional fields specific to your barangay

---

Need help? Check the Supabase documentation: https://supabase.com/docs
