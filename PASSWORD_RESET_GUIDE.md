# Password Reset Setup Guide

## ✅ What I've Created

I've implemented a complete password reset feature for your BRMS application:

### 1. **Forgot Password Page** (`/forgot-password`)
- User enters their email
- System sends a password reset link via email
- Clean UI with success/error messages

### 2. **Reset Password Page** (`/reset-password`)
- User sets a new password
- Password validation (minimum 8 chars, uppercase, lowercase, number)
- Secure token-based authentication

### 3. **API Routes**
- `/api/auth/forgot-password` - Sends reset email
- `/api/auth/reset-password` - Updates the password

### 4. **Login Page Integration**
- Added "Forgot password?" link on the login page

---

## 🔧 Setup Required

### Step 1: Configure Supabase Email Templates

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. Find **"Reset Password"** template
5. Update the template with this URL:
   ```
   {{ .SiteURL }}/reset-password?access_token={{ .Token }}&refresh_token={{ .RefreshToken }}&type=recovery
   ```

### Step 2: Update Environment Variables

Add this to your `.env.local` file:

```bash
# App URL for password reset redirect
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, change it to your actual domain:
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 3: Configure Supabase Site URL

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

3. Add **Redirect URLs**:
   - `http://localhost:3000/reset-password`
   - `https://yourdomain.com/reset-password` (for production)

---

## 📧 How to Reset Superadmin Password

### Method 1: Using the Forgot Password Feature (Recommended)

1. Go to http://localhost:3000/login
2. Click "Forgot password?"
3. Enter your superadmin email
4. Check your email inbox for the reset link
5. Click the link and set a new password
6. Log in with your new password

### Method 2: Manually in Supabase Dashboard

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your superadmin user
3. Click the three dots (•••) → **Reset Password**
4. A reset email will be sent to the user's email

### Method 3: Direct Database Update (If you have access)

If you need immediate access and can't receive emails:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query to reset password to a temporary one:

```sql
-- This will set password to 'TempPassword123!'
-- Make sure to change it immediately after logging in!
UPDATE auth.users
SET encrypted_password = crypt('TempPassword123!', gen_salt('bf'))
WHERE email = 'your-superadmin-email@example.com';
```

3. Log in with:
   - Email: `your-superadmin-email@example.com`
   - Password: `TempPassword123!`
4. Immediately go to Settings and change your password!

---

## 🧪 Testing the Password Reset Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/login

3. Click "Forgot password?"

4. Enter an email address that exists in your users table

5. Check your email (or Supabase logs if email isn't configured)

6. Click the reset link in the email

7. Set a new password (must meet requirements)

8. You'll be redirected to login - use your new password!

---

## ⚠️ Important Notes

- **Email Configuration**: Make sure Supabase email is properly configured in your project
- **Password Requirements**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Token Expiry**: Reset links expire after 1 hour for security
- **One-time Use**: Each reset link can only be used once

---

## 🐛 Troubleshooting

### "Invalid or expired reset link"
- The link may have expired (1 hour limit)
- The link may have already been used
- Request a new reset link

### Not receiving reset emails
1. Check Supabase → **Authentication** → **Logs** for email sending status
2. Verify email settings in Supabase Dashboard
3. Check spam/junk folder
4. Ensure SMTP is configured (for production)

### Development Mode Email Issues
In development, Supabase uses Mailtrap or similar services. Check:
- Supabase Dashboard → **Authentication** → **Email Templates** → **"Enable Email Confirmations"**
- Your email may appear in Supabase logs instead of actual email

---

## 🎉 You're All Set!

The password reset feature is now fully implemented. Users (including superadmin) can now reset their passwords securely through the `/forgot-password` page.

If you have any issues or need help with the setup, let me know!
