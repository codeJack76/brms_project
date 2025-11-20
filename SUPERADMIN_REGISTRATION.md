# Superadmin Registration Guide

## Overview
This system allows you to create the **first superadmin account** without requiring an invitation code. This is a one-time setup process.

---

## How to Register Superadmin

### Step 1: Access the Registration Page
Visit: `http://localhost:3000/register-superadmin`

### Step 2: Fill in the Form
- **Full Name**: Your full name
- **Email Address**: Your email (will be used for login)
- **Password**: At least 8 characters
- **Confirm Password**: Must match the password
- **Registration Code**: Enter `BRMS2025` (default code)

### Step 3: Submit
Click "Create Superadmin Account"

### Step 4: Login
After successful registration, you'll be redirected to the login page.
- Visit: `http://localhost:3000/api/auth/login`
- Login with your email and password via Auth0

---

## Features

### ✅ Security Measures
- **Registration code required** - Prevents unauthorized superadmin creation
- **One-time only** - Once a superadmin exists, this page blocks new registrations
- **Password validation** - Minimum 8 characters required
- **Email validation** - Proper email format required
- **Auto-redirect** - Redirects to login if superadmin already exists

### ✅ What Happens
1. Creates account in **Auth0** (authentication provider)
2. Creates user record in **Supabase** with `role='superadmin'`
3. Marks account as active
4. Stores metadata about registration

---

## API Endpoints

### POST /api/auth/register-superadmin
Creates the first superadmin account

**Request Body:**
```json
{
  "email": "admin@example.com",
  "name": "Admin User",
  "password": "securePassword123",
  "registrationCode": "BRMS2025"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Superadmin account created successfully! You can now login.",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "superadmin"
  }
}
```

**Response (Error - Already Exists):**
```json
{
  "error": "A superadmin account already exists. Please use the regular login process."
}
```

**Response (Error - Invalid Code):**
```json
{
  "error": "Invalid registration code"
}
```

### GET /api/auth/register-superadmin
Check if superadmin exists

**Response:**
```json
{
  "superadminExists": false,
  "needsRegistration": true
}
```

---

## Environment Variables

### SUPERADMIN_REGISTRATION_CODE
The secret code required to create a superadmin account.

**Default:** `BRMS2025`

**How to Change:**
1. Edit `.env.local`
2. Set `SUPERADMIN_REGISTRATION_CODE=YourSecretCode123`
3. Restart the development server
4. Use the new code when registering

**Important:** Keep this code secret! Anyone with this code can create a superadmin account (if none exists).

---

## Workflow After Registration

```
1. Register Superadmin
   ↓
2. Login via Auth0
   ↓
3. Create Invitations for other users
   ↓
4. Users sign up with invitation codes
   ↓
5. Manage roles and permissions
```

---

## Testing

### 1. Check if Database Tables Exist
Before registering, ensure your database is set up:
- Run migration: `supabase/migrations/003_users_barangays.sql`
- Check tables: `users`, `barangays`, `invitations`

### 2. Register Superadmin
```bash
# Visit in browser
http://localhost:3000/register-superadmin

# Fill in form with:
Name: System Administrator
Email: admin@yourdomain.com
Password: SecurePass123!
Registration Code: BRMS2025
```

### 3. Verify in Database
```sql
-- Check Supabase Dashboard → Table Editor → users
SELECT * FROM users WHERE role = 'superadmin';
```

### 4. Test Login
```bash
# Visit in browser
http://localhost:3000/api/auth/login

# Login with your registered email and password
```

### 5. Test Blocking
```bash
# Try to access registration page again
http://localhost:3000/register-superadmin

# Should show: "Superadmin Already Exists"
# And redirect to login page
```

---

## Troubleshooting

### "Invalid registration code"
- Check `.env.local` for `SUPERADMIN_REGISTRATION_CODE`
- Default code is `BRMS2025`
- Make sure you restart the dev server after changing it

### "A superadmin account already exists"
- This is intentional security - only one superadmin can be created this way
- To create another admin, login as superadmin and use invitations
- To reset: Delete the superadmin record from database (use with caution!)

### "Failed to create Auth0 account"
- Check Auth0 credentials in `.env.local`
- Ensure Auth0 Database Connection is enabled
- Check Auth0 Dashboard → Authentication → Database → Username-Password-Authentication

### "Database error"
- Ensure migration has been applied: `003_users_barangays.sql`
- Check Supabase connection
- Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

---

## Security Recommendations

### For Production:
1. **Change the registration code** - Don't use the default `BRMS2025`
2. **Disable the page after setup** - Comment out the route after creating superadmin
3. **Use environment-specific codes** - Different codes for dev/staging/production
4. **Monitor superadmin creation** - Set up alerts for new superadmin accounts
5. **Use strong passwords** - Enforce minimum 12 characters in production

### Example Production Setup:
```bash
# .env.production
SUPERADMIN_REGISTRATION_CODE=YourVerySecretCode2025!@#$
```

---

## After Superadmin Creation

Once you have a superadmin account:

1. **Login** → `http://localhost:3000/api/auth/login`
2. **Create Invitations** → Use `POST /api/invitations`
3. **Invite Team Members** → Send them invitation codes
4. **Manage Users** → Assign roles and permissions
5. **Configure System** → Set up barangays and settings

---

## Complete Flow Example

```javascript
// 1. Register Superadmin (via form)
// Visit: http://localhost:3000/register-superadmin

// 2. Login
window.location.href = '/api/auth/login';

// 3. Create invitation for secretary (after logged in)
fetch('/api/invitations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'secretary@barangay.local',
    role: 'secretary',
    barangay_id: 'uuid-of-barangay'
  })
}).then(r => r.json()).then(data => {
  console.log('Invitation code:', data.invitation.code);
  // Share this 6-digit code with the secretary
});

// 4. Secretary signs up
// They visit: http://localhost:3000/api/auth/login?mode=signup
// System checks for invitation and assigns role automatically
```

---

## Next Steps

After creating your superadmin account:

✅ Apply database migration if not done
✅ Register your superadmin account
✅ Login via Auth0
✅ Create invitations for your team
✅ Configure barangay information
✅ Set up roles and permissions
✅ Start using the system!

