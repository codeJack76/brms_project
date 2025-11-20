# BRMS (Barangay Records Management System) - AI Agent Guide

## Project Overview
Multi-tenant B2B SaaS for Philippine Barangay (village-level government) management. Each barangay gets isolated data with role-based access control. Built with Next.js 15 App Router (with Turbopack), Supabase (PostgreSQL + Auth + Storage), TypeScript, and Tailwind CSS v4.

**Key Architecture**: Single-page application (SPA) pattern - `src/app/page.tsx` handles all routing via state, importing page components from `src/app/pages/*.tsx`. No Next.js file-based routing for app pages.

---

## 🎯 Workflow: Plan → Execute → Verify

**CRITICAL**: Follow this spec-driven workflow for ALL changes. DO NOT skip to code.

### ⚡ Quick Decision Guide

**Simple Problem** (1 file, obvious fix):
- State your one-line plan: "Fix typo in ResidentsPage.tsx line 45"
- Execute immediately
- Quick verification: Does it work? Any side effects?

**Complex Problem** (multiple files, business logic, new features):
- STOP and create detailed plan first
- Get approval
- Execute in phases if needed
- Full verification with rubric

**Not sure?** → Default to detailed planning. Over-planning beats under-planning.

---

### 1️⃣ PLAN (Required Before Any Code)

#### From Tickets/Issues → Actionable Plan

When given a GitHub issue, user story, or vague request, **extract and clarify FIRST**:

```markdown
## Requirement Analysis

### User Intent
[What does the user actually want?]

### Requirements
- [Functional requirement 1]
- [Functional requirement 2]
- [...]

### Assumptions
- [What we're assuming about the system/user behavior]
- [...]

### Constraints
- Must maintain RLS multi-tenancy
- Cannot break existing API contracts
- Performance: queries must use indexes
- [Project-specific constraints]

### Edge Cases
- What if user is superadmin?
- What if barangay_id is null?
- What if field is empty/null/invalid?
- [Other edge cases]

### Out of Scope
- [What we're NOT doing in this task]

### Definition of Done
- [Specific, testable criteria for completion]
```

**Then** proceed to detailed implementation plan below.

---

#### Implementation Plan Structure

When given a task, **ALWAYS** produce a detailed plan FIRST:

```markdown
## Implementation Plan

### Overview
[One paragraph: what and why]

### Files Changed
- `path/to/file.ts` - CREATE: [purpose]
- `path/to/other.tsx` - MODIFY: [what changes]
- `path/to/old.ts` - DELETE: [why removing]

### Symbols Touched
- `ResidentsPage.handleSubmit()` - Add validation
- `GET /api/residents` - Add filtering
- `residents` table - Add index on email

### Implementation Steps
1. [Concrete step with file/function reference]
2. [Next step...]
3. [...]

### Acceptance Tests
- [ ] User can filter residents by purok
- [ ] Invalid email shows error message
- [ ] API returns 400 for missing required fields

### Mermaid Diagram (if needed for clarity)
\`\`\`mermaid
sequenceDiagram
    User->>Page: Click filter
    Page->>API: GET /api/residents?purok=1
    API->>Supabase: Query with RLS
    Supabase-->>API: Filtered data
    API-->>Page: JSON response
\`\`\`
```

**For complex tasks**, break into **phases**:
```markdown
## Phase 1: Database Schema
[Plan for phase 1]

## Phase 2: API Endpoints
[Plan for phase 2]

## Phase 3: UI Integration
[Plan for phase 3]
```

**Get approval before proceeding to execute.**

---

### 2️⃣ EXECUTE (Only After Plan Approval)

- Implement step-by-step following the approved plan
- Make **small, focused changes** - one file or function at a time
- Stay within approved scope - if you need to deviate, **update the plan first**
- Write/update tests alongside code changes
- Keep commits atomic and reference the plan

**Simple problems get simple solutions**: If the fix is obvious (typo, missing import, simple bug), state your one-line plan and execute immediately. Don't over-engineer.

---

### 3️⃣ VERIFY (After Implementation)

Run a **self-review** comparing implementation to the plan:

#### Verification Rubric

Categorize any issues found:

- 🔴 **CRITICAL**: Breaks requirements, core functionality, or security. MUST fix before proceeding.
- 🟠 **MAJOR**: Significant behavior/UX issues, performance problems, or missing error handling.
- 🟡 **MINOR**: Polish items - naming, comments, code clarity. Can defer.
- ⚪ **OUTDATED**: No longer relevant after changes.

**Verification Template**:
```markdown
## Verification Results

### Critical Issues
- [ ] **File**: `src/app/api/residents/route.ts:45`
  - **Issue**: Missing barangay_id in WHERE clause - breaks multi-tenancy
  - **Fix**: Add `.eq('barangay_id', userBarangayId)`

### Major Issues
- [ ] **File**: `src/app/pages/ResidentsPage.tsx:120`
  - **Issue**: No loading state during API call
  - **Fix**: Add `setLoading(true)` before fetch

### Minor Issues
- None

### Coverage
- ✅ All acceptance tests pass
- ✅ No new linting errors
- ✅ Related docs updated
```

**Re-verify after fixes until no Critical/Major issues remain.**

---

## 🚫 Guardrails (Prevent Drift)

1. **Missing requirements?** → ASK before coding
2. **Ambiguous behavior?** → CLARIFY before implementing
3. **Need new dependency?** → UPDATE PLAN and get approval
4. **Tests failing?** → STOP and fix before continuing
5. **Scope creeping?** → PROPOSE phase 2 instead of expanding current work

**Keep it simple**: Don't add abstraction layers, design patterns, or "nice-to-haves" unless explicitly in the plan.

---

## Architecture & Multi-Tenancy

### Data Isolation Pattern
**CRITICAL**: Every table has `barangay_id UUID` for tenant isolation. Row Level Security (RLS) policies enforce this at database level.

- **Table Structure**: All domain tables reference `barangays(id)` via `barangay_id`
- **Auto-Population**: `set_barangay_id()` trigger automatically sets `barangay_id` from `get_current_user_barangay()` on INSERT
- **RLS Enforcement**: Users can only SELECT/UPDATE/DELETE rows where `barangay_id = get_current_user_barangay()` OR user `is_superadmin()`
- **Auth Flow**: `users.auth0_id` (legacy column name) stores Supabase `auth.uid()` as TEXT (not UUID) - column kept for backward compatibility

### Database Schema (14 Tables)
Core entities: `barangays`, `users`, `residents`, `households`, `household_members`, `documents`, `files`, `clearances`, `blotter_records`, `financial_transactions`, `reports`, `settings`, `user_invitations`, `audit_logs`

**Migration Location**: `supabase/migrations/001_complete_database_setup.sql` - **single consolidated migration** creates entire schema with RLS. All previous migrations deleted/consolidated.

**CRITICAL Schema Pattern**: 
- All tables use UUID primary keys (`uuid_generate_v4()`)
- All tables have `barangay_id UUID REFERENCES barangays(id)`
- Standard timestamps: `created_at`, `updated_at` (some tables also have `deleted_at` for soft deletes)
- Snake_case naming in database, camelCase in TypeScript

### Authentication Architecture
- **Supabase Auth**: Primary authentication system using email/password
- **Invitation-Only**: Users must have valid invitation token in `user_invitations` table to sign up
- **First User Rule**: First signup automatically becomes `superadmin` with `barangay_id=NULL` for cross-tenant access
- **Auth Trigger**: `handle_new_user()` PostgreSQL function creates user record from invitation or makes first user superadmin
- **Session Management**: `AuthContext` (`src/app/context/AuthContext.tsx`) wraps entire app in `layout.tsx`, provides `useAuth()` hook
- **User Identification**: Database column `users.auth0_id` (legacy name from migration) stores Supabase `auth.uid()` as TEXT (not UUID)
- **RLS Pattern**: Policies use `auth.uid()::TEXT` compared with `users.auth0_id` for row-level security checks

**Legacy Note**: Column named `auth0_id` for backward compatibility from previous Auth0 implementation. All references to "auth0" in code/database refer to Supabase Auth - DO NOT use actual Auth0 services.

### Role-Based Access Control (RBAC)
6 roles with hierarchical permissions defined in `RBACContext.tsx`:
- `superadmin`: Cross-barangay access, manages all barangays
- `admin`: Full barangay management except user invites
- `captain`: Barangay captain, approves/deletes records
- `secretary`: Documents, clearances, blotter (no financial)
- `treasurer`: Financial transactions only
- `health_worker`: Residents and health documents only

**Permission Check Pattern**:
```tsx
const { hasPermission } = useRBAC();
if (hasPermission('canManageResidents')) { /* show UI */ }
```

---

## 🔐 Authentication Deep Dive

### Current System: Supabase Auth

**THIS PROJECT USES SUPABASE AUTH ONLY** - No Auth0, no third-party providers.

#### Sign Up Flow (Invitation-Only)
1. Admin creates invitation via `POST /api/users/invite` → generates token in `user_invitations` table
2. New user receives invitation link: `/signup?token={invitation_token}`
3. User enters email/password, submits to Supabase Auth
4. `handle_new_user()` trigger fires on `auth.users` insert:
   - Looks up invitation by email
   - Creates record in `public.users` with `barangay_id` from invitation
   - OR makes first user `superadmin` with `barangay_id=NULL`
5. User redirected to dashboard with session

#### Sign In Flow
1. User submits email/password to `supabase.auth.signInWithPassword()`
2. Supabase returns session with JWT containing `sub` claim (user ID)
3. `AuthContext` sets user state, `RBACContext` fetches user details from `public.users`
4. `update_user_last_login()` trigger updates `last_login_at`

#### Session Management
- **Client**: `AuthContext` listens to `supabase.auth.onAuthStateChange()`
- **Server**: API routes read session from request headers automatically
- **RLS**: `auth.uid()` in policies returns current user's ID from JWT

#### Important Auth Implementation Details

**Database Column**: `users.auth0_id`
- **Type**: `VARCHAR(255)` (TEXT, not UUID)
- **Contains**: Supabase `auth.uid()` value
- **Why "auth0"**: Legacy naming from previous Auth0 implementation (do NOT use Auth0 services)
- **Usage**: `WHERE auth0_id = auth.uid()::TEXT` in RLS policies

**Auth Functions** (`src/app/context/AuthContext.tsx`):
```typescript
const { user, session, loading, signIn, signUp, signOut, resetPassword } = useAuth();

// Sign in
await signIn(email, password);

// Sign up (requires valid invitation token in URL)
await signUp(email, password, name);

// Sign out
await signOut(); // Clears session, redirects to landing

// Password reset
await resetPassword(email); // Sends magic link
```

**Protected Routes Pattern**:
```tsx
// In page component
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />; // Or LandingPage

// Render protected content
```

**Auth Environment Variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://{project}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY={anon_key}
SUPABASE_SERVICE_ROLE_KEY={service_role_key}  # Server-side only
```

---

## File Conventions & Patterns

### Directory Structure
- `src/app/api/*/route.ts` - Next.js API routes (use server-side `supabaseAdmin` from `@/lib/supabase/server`)
- `src/app/pages/*.tsx` - Page components (**NOT Next.js pages/routes**, imported by `src/app/page.tsx` SPA router)
- `src/app/context/*.tsx` - React Context providers (all use `'use client'`)
- `src/lib/supabase/` - Supabase clients: `client.ts` (browser), `server.ts` (API routes with service role key)
- `src/components/` - Shared components (Modal, FileUpload, FileList)
- `supabase/migrations/` - Database migrations (currently single file: `001_complete_database_setup.sql`)

### Supabase Client Usage Pattern
**CRITICAL**: Use correct client based on context:

```typescript
// Browser components (with 'use client')
import { supabase } from '@/lib/supabase/client'; // Uses anon key + RLS

// API routes (server-side)
import { supabaseAdmin } from '@/lib/supabase/server'; // Uses service role key, bypasses RLS
```

**IMPORTANT**: Even though `supabaseAdmin` uses service role key, RLS policies still apply when they check `auth.uid()` from JWT token. The service role key allows bypassing RLS only when policies don't reference `auth.uid()`.

### API Route Pattern
All API routes follow this structure:
```typescript
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // 1. Get user from auth header or session
  // 2. Query with .from('table').select() - RLS auto-filters by barangay_id
  // 3. Return NextResponse.json()
}

export async function POST(request: NextRequest) {
  // 1. Parse await request.json()
  // 2. Validate data
  // 3. Insert with .from('table').insert() - trigger sets barangay_id
  // 4. Return created resource
}
```

**Note**: API routes use `supabaseAdmin` but RLS policies still apply because they check `auth.uid()` from JWT token. Service role key only bypasses RLS when no auth context is needed.

### Component Pattern (Pages)
Page components in `src/app/pages/` follow this structure:
```tsx
'use client'; // Always needed for useState/useEffect

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRBAC } from '@/app/context/RBACContext';
import Modal from '@/components/Modal';

export default function SomePage() {
  const { user } = useAuth();
  const { hasPermission } = useRBAC();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData(); // Fetch from API route via fetch()
  }, []);
  
  // Modal state for CRUD operations
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit' | 'delete' | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Permission-gated UI rendering
  {hasPermission('canManageResidents') && <button>Add</button>}
}
```

**Page Routing**: Pages are rendered in `src/app/page.tsx` based on `currentPage` state - it's a SPA, not Next.js file-based routing.

### File Upload Pattern
Files are stored in **Supabase Storage** with multi-tenant folder structure:
- **Buckets**: `documents` (private), `photos` (public), `reports` (private)
- **Path Structure**: `{bucket}/{barangay_id}/{filename}` - enforced by RLS policies
- **Component**: Use `<FileUpload />` from `@/components/FileUpload.tsx`
- **Database Record**: After upload, insert into `files` table with `storage_path`, `storage_bucket`, `entity_type`, `entity_id`

```typescript
// Upload example
const result = await uploadFile(file, {
  bucket: 'documents',
  category: 'clearance',
  entityType: 'clearance',
  entityId: clearanceId,
  ownerId: userId,
});

// Files table stores metadata, actual file in storage bucket
```

## Development Workflows

### Running the App
```powershell
npm run dev              # Start with Turbopack (default in package.json)
# Opens http://localhost:3000

npm run build            # Production build with Turbopack
npm start                # Start production server
```

**Default Port**: 3000 (no configuration needed)

### Database Migrations
**IMPORTANT**: Single consolidated migration file - all previous migrations deleted.
```powershell
# Method 1: Supabase Dashboard (RECOMMENDED)
# 1. Go to https://supabase.com/dashboard → your project → SQL Editor
# 2. Click "New query"
# 3. Paste entire contents of supabase/migrations/001_complete_database_setup.sql
# 4. Click "Run"

# Method 2: Supabase CLI (requires npx and Supabase project link)
npx supabase db push    # Pushes migration to linked project
```

**Migration Structure**: 1017 lines creating:
- Extensions (uuid-ossp, pgcrypto)
- 14 tables with full schema
- RLS helper functions (`get_current_user_barangay()`, `set_barangay_id()`, `is_superadmin()`)
- Triggers for auto-setting `barangay_id`
- RLS policies for all tables
- Auth triggers (`handle_new_user()`, `update_user_last_login()`)
- Indexes and constraints

### Testing Multi-Tenancy
Use `test-supabase.js` to check database state:
```powershell
node test-supabase.js  # Lists all tables, checks for barangay_id columns
```

### Debugging Auth Issues
Common issues:
- **"No valid invitation"**: Check `user_invitations` table has `status='pending'` and `expires_at > NOW()`
- **"Barangay_id null"**: Ensure user record has `barangay_id` set, triggers might not have fired, or user is first superadmin
- **"Access denied"**: Check RLS policies in Dashboard → Database → Policies, verify user's role and barangay_id
- **"User ID mismatch"**: Verify `users.auth0_id` (TEXT, legacy column name) matches Supabase `auth.uid()` value exactly

**Debug Tools**:
```powershell
node test-supabase.js   # Test database connection and list tables
```

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://{project_id}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY={anon_key}
SUPABASE_SERVICE_ROLE_KEY={service_role_key}  # Server-side only
```

## Project-Specific Patterns

### TypeScript Patterns
- **No strict null checks**: Many optional fields use `?:` without null checks
- **Any types**: Supabase responses often use `any` due to dynamic schema
- **Type ignores**: Used for Supabase type inference issues: `// @ts-ignore - Supabase type inference issue`

### State Management
- **No global state library**: Pure React Context for auth/RBAC/theme
- **Local component state**: Each page manages its own data fetching and modal states
- **No React Query/SWR**: Direct `fetch()` calls to API routes with manual loading states
- **Context Providers Hierarchy**: `ThemeProvider` → `AuthProvider` → `RBACProvider` (defined in `src/app/layout.tsx`)

### Styling Conventions
- **Tailwind CSS v4**: Utility-first classes, new config format in `postcss.config.mjs`
- **No CSS modules**: All inline Tailwind classes
- **Color palette**: Primary colors hardcoded in classes (e.g., `blue-600`, `gray-800`) - no theme config
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Dark mode**: Implemented via `ThemeContext` with `dark` class toggled on `<html>` element
- **Icons**: Lucide-react for all icons (consistent icon library)

## Data Flow & Integration Patterns

### Client → API → Database Flow
```
User Action (Page Component)
  ↓ fetch('/api/resource')
API Route (route.ts)
  ↓ supabaseAdmin.from('table').select()
Supabase (RLS checks auth.uid())
  ↓ Filter by barangay_id
Return filtered data
  ↓ NextResponse.json()
Component setState()
  ↓ Re-render UI
```

**Key Points**:
- Client components use `fetch()` to call API routes (no direct Supabase calls from browser)
- API routes authenticate via Supabase Auth session
- RLS automatically filters by user's `barangay_id`
- Superadmins (`is_superadmin()` returns true) see all data across barangays

### Form Submission Pattern
```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const response = await fetch('/api/resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    const result = await response.json();
    if (result.success) {
      setNotification({ type: 'success', message: result.message });
      fetchData(); // Refresh list
      setShowModal(false);
    } else {
      setNotification({ type: 'error', message: result.error });
    }
  } catch (error) {
    setNotification({ type: 'error', message: 'Network error' });
  } finally {
    setLoading(false);
  }
};
```

### File Upload Integration
Files stored in **Supabase Storage** with metadata in `files` table:

1. **Upload**: `FileUpload` component → Storage bucket → Returns storage path
2. **Metadata**: Insert to `files` table with `storage_path`, `entity_type`, `entity_id`
3. **Retrieval**: Query `files` table → Get signed URL from storage → Display/download
4. **RLS**: Storage policies enforce `{barangay_id}/` path prefix

**Storage Buckets**:
- `documents` (private) - Clearances, official documents
- `photos` (public) - Profile photos, public images  
- `reports` (private) - Generated reports

## Dependencies & External Services

### Core Dependencies (package.json)
- **Next.js 15.5.6**: App Router with Turbopack bundler
- **React 19.1.0**: Latest React with improved hooks
- **@supabase/supabase-js ^2.75.1**: Supabase client library
- **Tailwind CSS v4**: Utility-first CSS framework
- **lucide-react ^0.548.0**: Icon library (replaces heroicons)
- **TypeScript ^5**: Type safety

### Legacy Dependencies
- **auth0-lock ^14.1.0**: REMOVED from active use - kept in package.json for migration history only. All authentication uses Supabase Auth. DO NOT import or use Auth0 in new code.

### External Services
1. **Supabase** (Primary backend):
   - PostgreSQL database with RLS
   - Authentication (email/password, invitation-based signup)
   - Storage (multi-tenant file storage)
   - Real-time subscriptions (not currently used)
   - Edge Functions (not currently used)

2. **Vercel** (Recommended deployment):
   - Next.js optimized hosting
   - Automatic HTTPS
   - Edge CDN
   - Environment variables management

### Environment Configuration
Required variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

**Security**: 
- `NEXT_PUBLIC_*` variables exposed to browser
- `SUPABASE_SERVICE_ROLE_KEY` server-only (bypasses RLS when needed)
- Never commit `.env.local` to git (in `.gitignore`)

### No External APIs
Currently no third-party API integrations (no payment gateways, email services, SMS, etc.). All functionality self-contained within Supabase ecosystem.

### Modal Pattern
All CRUD operations use `Modal` component (`@/components/Modal.tsx`):
- **Modes**: `'view' | 'create' | 'edit' | 'delete'` stored in state
- **Form handling**: Controlled inputs with individual state variables (no form library)
- **Validation**: Client-side only, basic required field checks

### API Response Pattern
Consistent response structure:
```typescript
// Success
{ success: true, data: {...}, message: 'Success message' }

// Error
{ success: false, error: 'Error message' }
```

### Naming Conventions
- **Database**: `snake_case` (e.g., `barangay_id`, `first_name`)
- **TypeScript**: `camelCase` for variables, `PascalCase` for types/components
- **Files**: `PascalCase.tsx` for components, `kebab-case.ts` for utilities
- **API Routes**: RESTful: `/api/residents`, `/api/residents/[id]`

## Critical "Gotchas"

1. **Legacy Column Naming**: `users.auth0_id` column name is from previous Auth0 migration - it now stores Supabase `auth.uid()`. DO NOT use Auth0 services.
2. **User ID is TEXT not UUID**: `users.auth0_id` stores Supabase user ID as TEXT (not UUID) for compatibility - use `auth.uid()::TEXT` in RLS policies
3. **RLS Functions Use SECURITY DEFINER**: Helper functions like `get_current_user_barangay()` must be SECURITY DEFINER to access `auth.uid()`
4. **First User Auto-Superadmin**: First signup has `barangay_id=NULL` and `role='superadmin'` - can see all barangays
5. **Trigger-Based barangay_id**: Never manually set `barangay_id` in INSERT statements - `set_barangay_id()` trigger handles it automatically
6. **Storage Paths Must Match RLS**: Upload paths MUST be `{barangay_id}/...` or RLS blocks access - enforced in storage policies
7. **Windows PowerShell**: Use `;` for command chaining, not `&&` (e.g., `cd folder ; npm install`)
8. **SPA Router Pattern**: `src/app/page.tsx` manages navigation via state - don't create new files in `app/` expecting Next.js routing
9. **Type Coercion in RLS**: Use `auth.uid()::TEXT` when comparing with `users.auth0_id` (UUID to TEXT conversion)

## Common Tasks

**Remember**: For each task below, follow **Plan → Execute → Verify** workflow.

### Adding a New Page

**Plan Phase - Identify**:
1. Page component file to create
2. API route(s) needed
3. Navigation changes in `page.tsx`
4. Permission checks required
5. New types/interfaces

**Implementation Steps**:
1. Create `src/app/pages/NewPage.tsx` with `'use client'` directive
2. Import in `src/app/page.tsx` and add to navigation sidebar
3. Add route case in `src/app/page.tsx` switch statement for `currentPage` state
4. Add permission check using `canAccessPage()` function if needed
5. Create corresponding API route in `src/app/api/new-resource/route.ts`

**Example Navigation Addition**:
```tsx
// In src/app/page.tsx
import NewPage from './pages/NewPage';

// In sidebar nav
{canAccessPage('newpage') && (
  <button onClick={() => setCurrentPage('newpage')}>New Page</button>
)}

// In main content area
{currentPage === 'newpage' && <NewPage />}
```

**Verification Checklist**:
- [ ] Page renders without errors
- [ ] Navigation button appears for authorized roles only
- [ ] API endpoints return correct data
- [ ] Dark mode styling works
- [ ] Mobile responsive

---

### Adding a New Table

**Plan Phase - Database Changes**:
1. Table schema with columns
2. RLS policy design
3. Trigger configuration
4. Index strategy
5. Migration impact analysis

**Implementation Steps**:
1. Add SQL to `supabase/migrations/001_complete_database_setup.sql` (or create new migration file)
2. Table must include: `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`, `barangay_id UUID REFERENCES barangays(id) ON DELETE CASCADE`
3. Add standard timestamps: `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`, `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
4. Create RLS policy: `CREATE POLICY "policy_name" ON table_name FOR ALL USING (barangay_id = get_current_user_barangay() OR is_superadmin());`
5. Add trigger: `CREATE TRIGGER set_barangay_id_table BEFORE INSERT ON table_name FOR EACH ROW EXECUTE FUNCTION set_barangay_id();`
6. Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
7. Add indexes as needed: `CREATE INDEX idx_table_barangay ON table_name(barangay_id);`
8. Create TypeScript interface in API route matching snake_case schema
9. Create API route following pattern: GET (list), POST (create), GET by id, PUT, DELETE

**Table Creation Template**:
```sql
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barangay_id UUID REFERENCES barangays(id) ON DELETE CASCADE,
  -- your columns here
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_table_name_barangay ON table_name(barangay_id);
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "table_name_multi_tenant" ON table_name FOR ALL 
  USING (barangay_id = get_current_user_barangay() OR is_superadmin());

CREATE TRIGGER set_barangay_id_table_name BEFORE INSERT ON table_name
  FOR EACH ROW EXECUTE FUNCTION set_barangay_id();
```

**Verification Checklist**:
- [ ] Migration runs without errors
- [ ] RLS blocks cross-tenant access (test with non-superadmin)
- [ ] Superadmin can see all records
- [ ] Trigger auto-sets barangay_id correctly
- [ ] Indexes improve query performance
- [ ] Foreign key constraints enforced

---

### Modifying Permissions
Edit `ROLE_PERMISSIONS` object in `src/app/context/RBACContext.tsx` - no database changes needed. Changes apply immediately on next page load.

**Permission Types**: 
- `canManageBarangays` (superadmin only)
- `canManageAllUsers` (superadmin only)  
- `canManageUsers`, `canManageResidents`, `canManageDocuments`, `canManageClearances`
- `canManageBlotter`, `canManageFinancials`, `canViewReports`, `canManageSettings`
- `canApprove`, `canDelete`, `canViewAuditLogs`, `canManageSubscriptions`

### Debugging RLS Issues
```sql
-- Check if RLS is enabled
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;

-- View policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test policy as user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM your_table; -- Should only see user's barangay data
```

---

## 📋 Definition of Done (DoD)

Before considering any task complete, verify:

- ✅ All acceptance tests from the plan pass
- ✅ No Critical or Major issues in verification rubric
- ✅ Tests written/updated for changed behavior
- ✅ No regressions in existing functionality
- ✅ RLS policies tested for multi-tenancy (if database change)
- ✅ Error handling added for edge cases
- ✅ TypeScript types are correct (no `any` unless justified)
- ✅ Loading states and user feedback implemented (if UI change)
- ✅ Dark mode works (if UI change)
- ✅ Responsive design verified on mobile/tablet (if UI change)
- ✅ Documentation updated (README, migration docs if schema change)
- ✅ Commit messages are clear and reference the task

---

## 📝 Commit & PR Standards

### Commit Message Format
```
<scope>: <imperative summary>

- Bullet point of key change
- Another key change
- Reference to issue/task if applicable
```

**Examples**:
```
residents: add email validation to create form

- Add regex validation for email field
- Show error message below input
- Prevent form submission if invalid
- Add unit test for validation function
```

```
api/clearances: fix RLS bypass vulnerability

- Add barangay_id filter to clearance query
- Add test case for cross-tenant access attempt
- Update RLS policy to use is_superadmin()
```

### PR Description Template
```markdown
## Intent
[What are you changing and why?]

## Plan Summary
**Files Modified:**
- `src/app/pages/ResidentsPage.tsx` - Added email validation
- `src/app/api/residents/route.ts` - Stricter input validation

**Symbols Changed:**
- `ResidentsPage.handleSubmit()` - validation logic
- `POST /api/residents` - schema validation

## Test Coverage
- Added `validateEmail()` unit test
- Updated integration test for invalid email handling
- Manual testing: [scenarios tested]

## Verification Results
- [x] No Critical/Major issues
- [x] All acceptance tests pass
- [x] Dark mode verified
- [x] Mobile responsive

## Risks & Mitigations
- **Risk**: Email validation might be too strict for edge cases
- **Mitigation**: Uses RFC 5322 compliant regex, added override for admins

## Screenshots/Videos
[If UI changes]
```

---

## 🔍 Review Categories (Post-Implementation)

After completing changes, run focused reviews in these areas:

### Bug Review
- Edge cases handled (null, empty, overflow)?
- Error states have user-friendly messages?
- Race conditions in async operations?
- Off-by-one errors in loops/pagination?

### Performance Review
- Database queries optimized (indexes used)?
- N+1 query problems?
- Large lists paginated?
- Unnecessary re-renders in React?
- Heavy computations memoized?

### Security Review
- RLS policies enforced?
- User input sanitized?
- SQL injection prevented (using parameterized queries)?
- XSS prevented (React escaping, no dangerouslySetInnerHTML)?
- Sensitive data in environment variables, not code?
- API endpoints check user permissions?

### Code Clarity Review
- Variable/function names descriptive?
- Complex logic has comments explaining "why"?
- Magic numbers extracted to constants?
- Repeated code extracted to functions?
- TypeScript types explicit (not inferred `any`)?

**Output findings in verification rubric format (Critical/Major/Minor) and propose fixes.**

---

## References
- **Key Files**: `src/app/context/RBACContext.tsx` (permissions), `supabase/migrations/001_complete_database_setup.sql` (schema), `src/lib/supabase/client.ts` vs `server.ts` (Supabase clients)
- **Migration Docs**: `MIGRATION_GUIDE.md`, `DATABASE_MIGRATION_REPORT.md`, `MIGRATION_COMPLETE.md`
- **Example Components**: `src/app/pages/ResidentsPage.tsx` (full CRUD), `src/components/FileUpload.tsx` (storage)
