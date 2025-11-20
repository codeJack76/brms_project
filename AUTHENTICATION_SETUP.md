# Authentication APIs - Quick Start

## ✅ What I Created

### API Routes:
1. **`/api/auth/login`** - Initiates Auth0 login/signup
2. **`/api/auth/callback`** - Handles Auth0 OAuth callback
3. **`/api/auth/sync`** - Syncs Auth0 user to Supabase database
4. **`/api/auth/session`** - Gets current user session
5. **`/api/auth/logout`** - Logs out user
6. **`/api/invitations`** - Creates and verifies invitation codes

---

## 🔧 Setup Required

### 1. Get Auth0 Client Secret
```
1. Go to https://manage.auth0.com
2. Applications → Select your app
3. Settings → Copy "Client Secret"
4. Add to .env.local:
   AUTH0_CLIENT_SECRET=your_secret_here
```

### 2. Configure Auth0 Callback URLs
In Auth0 Dashboard → Application Settings, add:
- **Allowed Callback URLs**: `http://localhost:3001/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3001`
- **Allowed Web Origins**: `http://localhost:3001`

### 3. Apply Database Migration
```sql
-- Run this in Supabase Dashboard → SQL Editor
-- Copy from: supabase/migrations/003_users_barangays.sql
-- This creates: users, barangays, invitations tables
```

---

## 🚀 How It Works

### Authentication Flow:
```
User clicks "Login" 
  ↓
GET /api/auth/login?mode=signup
  ↓
Redirects to Auth0
  ↓
User logs in at Auth0
  ↓
Auth0 redirects to /api/auth/callback?code=xxx
  ↓
System exchanges code for tokens
  ↓
POST /api/auth/sync (creates/updates user in Supabase)
  ↓
Sets session cookies
  ↓
Redirects to /dashboard
```

### Invitation Flow:
```
Admin creates invitation
  ↓
POST /api/invitations { email, role }
  ↓
Returns 6-digit code
  ↓
New user signs up via Auth0
  ↓
/api/auth/sync checks for invitation
  ↓
Creates user with invited role
  ↓
Marks invitation as accepted
```

---

## 📝 Quick Test

### 1. Test Login (in browser):
```
http://localhost:3001/api/auth/login
```

### 2. Create Invitation (after logging in):
```javascript
fetch('/api/invitations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    role: 'staff'
  })
}).then(r => r.json()).then(console.log);
```

### 3. Check Session:
```
http://localhost:3001/api/auth/session
```

---

## 🔐 Security Features

✅ HttpOnly cookies for tokens (not accessible via JS)
✅ CSRF protection with state parameter
✅ Invitation required for new signups
✅ Role-based access control
✅ Invitation codes expire in 7 days
✅ Session validation on protected routes

---

## 📦 What's Stored Where

### Auth0 (Authentication):
- User credentials
- OAuth tokens
- Login sessions

### Supabase (Database):
- User profiles
- Roles and permissions
- Barangay assignments
- Invitation codes

### Cookies (Session):
- `auth_token` - Access token (httpOnly)
- `user_email` - User's email
- `user_role` - User's role

---

## 🎯 Next Steps

1. ✅ **Get AUTH0_CLIENT_SECRET** from Auth0 dashboard
2. ✅ **Configure callback URLs** in Auth0
3. ✅ **Apply database migration** in Supabase
4. ✅ **Update LoginPage** to use `/api/auth/login`
5. ✅ **Test the flow** end-to-end

---

## 💡 Frontend Integration

### Update your LoginPage:
```tsx
// Instead of demo login, redirect to Auth0
const handleLogin = () => {
  window.location.href = '/api/auth/login?mode=login';
};

const handleSignup = () => {
  window.location.href = '/api/auth/login?mode=signup';
};
```

### Check if user is logged in:
```tsx
useEffect(() => {
  fetch('/api/auth/session')
    .then(r => r.json())
    .then(data => {
      if (data.authenticated) {
        // User is logged in
        setUser(data.user);
      } else {
        // User is not logged in
        router.push('/login');
      }
    });
}, []);
```

---

## 📚 Full Documentation

See `AUTHENTICATION_GUIDE.md` for complete documentation including:
- Detailed API specs
- Error handling
- Troubleshooting guide
- Production deployment checklist
