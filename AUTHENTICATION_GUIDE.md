# Authentication System Documentation

## Overview
This system uses **Auth0** for authentication and **Supabase** as the database backend. Users authenticate via Auth0, and their data is synced to Supabase.

---

## Architecture

```
User → Auth0 Login → Auth0 Callback → Sync to Supabase → Session Cookies → Dashboard
```

### Flow:
1. User clicks "Login" or "Sign Up"
2. Redirected to Auth0 hosted login page
3. After successful login, Auth0 redirects to `/api/auth/callback`
4. System exchanges code for tokens
5. User info synced to Supabase database
6. Session cookies set
7. User redirected to dashboard

---

## API Endpoints

### 1. **GET /api/auth/login**
Initiates Auth0 login flow

**Query Parameters:**
- `mode` (optional): `'login'` or `'signup'` - determines which screen to show

**Example:**
```bash
# Login
GET http://localhost:3001/api/auth/login?mode=login

# Signup
GET http://localhost:3001/api/auth/login?mode=signup
```

**Response:**
Redirects to Auth0 hosted login page

---

### 2. **GET /api/auth/callback**
Handles OAuth callback from Auth0

**Query Parameters:**
- `code`: Authorization code from Auth0
- `state`: CSRF protection token

**Response:**
- Sets session cookies
- Redirects to `/dashboard`

**Cookies Set:**
- `auth_token`: Access token (httpOnly)
- `user_email`: User's email (readable by client)
- `user_role`: User's role (readable by client)

---

### 3. **POST /api/auth/sync**
Syncs Auth0 user to Supabase database

**Request Body:**
```json
{
  "auth0_id": "auth0|123456",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "staff",
    "barangay_id": "uuid or null"
  }
}
```

**Errors:**
- `403`: No invitation found - user must be invited first
- `500`: Database error

**Logic:**
- If user exists: Updates metadata and last_login
- If new user: Checks for invitation, creates user with invited role

---

### 4. **GET /api/auth/session**
Gets current authenticated user

**Headers:**
Requires cookies: `auth_token`, `user_email`

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "staff",
    "barangay_id": "uuid",
    "picture": "https://..."
  }
}
```

**Errors:**
- `401`: Not authenticated
- `403`: Account inactive
- `404`: User not found

---

### 5. **GET /api/auth/logout**
Logs out user and clears session

**Response:**
- Clears all session cookies
- Redirects to Auth0 logout endpoint
- Returns to landing page

---

### 6. **POST /api/invitations**
Creates invitation for new user (requires authentication)

**Headers:**
Requires cookies: `auth_token`, `user_email`

**Authorization:**
Only users with roles: `superadmin`, `barangay_captain`, `secretary`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "staff",
  "barangay_id": "uuid-optional"
}
```

**Response:**
```json
{
  "success": true,
  "invitation": {
    "id": "uuid",
    "email": "newuser@example.com",
    "code": "123456",
    "role": "staff",
    "expires_at": "2025-11-06T..."
  },
  "message": "Invitation created successfully"
}
```

**Errors:**
- `401`: Not authenticated
- `403`: Insufficient permissions
- `409`: User or invitation already exists

---

### 7. **GET /api/invitations?code=123456**
Verifies invitation code

**Query Parameters:**
- `code`: 6-digit invitation code

**Response:**
```json
{
  "success": true,
  "invitation": {
    "email": "newuser@example.com",
    "role": "staff",
    "barangay_id": "uuid",
    "expires_at": "2025-11-06T..."
  }
}
```

**Errors:**
- `404`: Invalid code
- `400`: Already used or expired

---

## Environment Variables

Add these to your `.env.local`:

```bash
# Auth0 Configuration
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Getting Auth0 Client Secret:
1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Applications → Your Application
3. Settings tab
4. Copy the "Client Secret"
5. Add to `.env.local`

### Configure Auth0 Callback URLs:
In Auth0 Dashboard → Application Settings:
- **Allowed Callback URLs**: `http://localhost:3001/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3001`
- **Allowed Web Origins**: `http://localhost:3001`

---

## Database Setup

You need to apply the migration to create required tables:

### Method 1: Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/003_users_barangays.sql`
3. Paste and click "Run"

### Method 2: Supabase CLI
```bash
supabase db push
```

### Tables Created:
- `users` - Stores user accounts with roles
- `barangays` - Stores barangay information
- `invitations` - Stores invitation codes

---

## User Roles

The system supports these roles:

1. **superadmin** - System-wide administrator
2. **barangay_captain** - Barangay Captain (can invite users)
3. **secretary** - Secretary (can invite users)
4. **treasurer** - Treasurer
5. **staff** - General staff member
6. **peace_order_officer** - Peace & Order Officer
7. **health_officer** - Health Officer
8. **social_worker** - Social Worker

---

## Invitation Workflow

### Creating First Superadmin:
Since no users exist initially, you need to manually create the first superadmin:

1. Apply the migration (creates demo users)
2. Or manually insert:
```sql
INSERT INTO users (email, name, role, is_active)
VALUES ('admin@yourdomain.com', 'System Admin', 'superadmin', true);
```

3. Create invitation for yourself:
```sql
INSERT INTO invitations (email, code, role, expires_at)
VALUES ('admin@yourdomain.com', '123456', 'superadmin', NOW() + INTERVAL '7 days');
```

### Inviting New Users:
1. Login as superadmin/captain/secretary
2. Call `POST /api/invitations` with user email and role
3. Share the 6-digit code with the user
4. User signs up via Auth0 (email must match invitation)
5. System automatically assigns role from invitation

---

## Testing the System

### 1. Check if tables exist:
```bash
# Visit Supabase Dashboard → Table Editor
# Should see: users, barangays, invitations
```

### 2. Test Auth0 login:
```bash
# Visit in browser:
http://localhost:3001/api/auth/login?mode=login
```

### 3. Create test invitation:
```javascript
// In browser console after logging in:
fetch('/api/invitations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'testuser@example.com',
    role: 'staff'
  })
}).then(r => r.json()).then(console.log);
```

### 4. Verify invitation:
```bash
# Visit in browser:
http://localhost:3001/api/invitations?code=123456
```

### 5. Check session:
```bash
# After logging in, visit:
http://localhost:3001/api/auth/session
```

---

## Security Features

1. **HttpOnly Cookies**: Auth tokens not accessible via JavaScript
2. **CSRF Protection**: State parameter in OAuth flow
3. **Role-Based Access**: API endpoints check user permissions
4. **Invitation Required**: New users must have valid invitation
5. **Expiring Invitations**: Codes expire after 7 days
6. **Secure Sessions**: Cookies marked secure in production

---

## Troubleshooting

### "No invitation found"
- User's email must match an invitation in the database
- Check `invitations` table for pending invitations
- Ensure invitation hasn't expired or been accepted

### "Authentication required"
- Cookies might be blocked
- Try logging out and back in
- Check browser console for cookie issues

### "Failed to sync user"
- Database tables might not exist
- Apply migration: `003_users_barangays.sql`
- Check Supabase connection

### Auth0 callback fails
- Verify `AUTH0_CLIENT_SECRET` in `.env.local`
- Check Auth0 callback URLs are configured
- Look at server logs for detailed error

---

## Next Steps

1. **Apply Database Migration** - Run `003_users_barangays.sql` in Supabase
2. **Configure Auth0** - Add callback URLs, get client secret
3. **Create First Admin** - Manually insert superadmin or use seeded demo users
4. **Test Login Flow** - Visit `/api/auth/login`
5. **Create Invitations** - Use API to invite new users
6. **Integrate with Frontend** - Update LoginPage to redirect to `/api/auth/login`

---

## Example Usage in Frontend

### Login Button:
```tsx
<button onClick={() => window.location.href = '/api/auth/login?mode=login'}>
  Login with Auth0
</button>
```

### Signup Button:
```tsx
<button onClick={() => window.location.href = '/api/auth/login?mode=signup'}>
  Sign Up
</button>
```

### Logout Button:
```tsx
<button onClick={() => window.location.href = '/api/auth/logout'}>
  Logout
</button>
```

### Check Session:
```tsx
useEffect(() => {
  fetch('/api/auth/session')
    .then(r => r.json())
    .then(data => {
      if (data.authenticated) {
        setUser(data.user);
      }
    });
}, []);
```

---

## Production Deployment

Before deploying to production:

1. Update `NEXT_PUBLIC_APP_URL` to your domain
2. Set `NODE_ENV=production`
3. Update Auth0 callback URLs to production domain
4. Use secure cookies (automatically enabled in production)
5. Add rate limiting to invitation endpoint
6. Set up email notifications for invitation codes
7. Implement password hashing for stored passwords
8. Add audit logging for sensitive operations
