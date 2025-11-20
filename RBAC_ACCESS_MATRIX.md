# Role-Based Access Control (RBAC) - Page Access Matrix

## Overview
This document defines which pages each user role can access in the Barangay Records Management System (BRMS).

## Role Descriptions

| Role | Description | Primary Responsibilities |
|------|-------------|-------------------------|
| **Superadmin** | Full system administrator | System-wide management, all permissions |
| **Barangay Captain** | Barangay leader | Full operational control of barangay |
| **Secretary** | Administrative officer | Documentation and administrative tasks |
| **Treasurer** | Financial officer | Financial records and transactions |
| **Staff** | General administrative staff | Administrative support, basic operations |
| **Peace & Order Officer** | Law enforcement officer | Blotter records, incident management |
| **Health Officer** | Health services coordinator | Health programs and resident health records |
| **Social Worker** | Social services coordinator | Welfare programs and assistance |

## Page Access Matrix

| Page | Superadmin | Barangay Captain | Secretary | Treasurer | Staff | Peace & Order | Health Officer | Social Worker |
|------|:----------:|:----------------:|:---------:|:---------:|:-----:|:-------------:|:--------------:|:-------------:|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Residents** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Documents** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Clearances** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Blotter** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Financial** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Reports** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Settings** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Detailed Page Access by Role

### 1. Superadmin
**Access Level:** Full System Access
- ✅ Dashboard - System overview
- ✅ Residents - Full resident management
- ✅ Documents - All document management
- ✅ Clearances - Process all clearances
- ✅ Blotter - View and manage all incidents
- ✅ Financial - Complete financial oversight
- ✅ Reports - Generate all reports
- ✅ Settings - System configuration and user management

**Special Permissions:**
- Can create Barangay Captain accounts
- Full system configuration access
- Can manage all barangays

---

### 2. Barangay Captain
**Access Level:** Full Operational Access
- ✅ Dashboard - Barangay overview
- ✅ Residents - Full resident management
- ✅ Documents - All document management
- ✅ Clearances - Process all clearances
- ✅ Blotter - View and manage all incidents
- ✅ Financial - Complete financial oversight
- ✅ Reports - Generate all reports
- ✅ Settings - Barangay configuration and user management

**Special Permissions:**
- Can create member accounts (Secretary, Treasurer, Staff, Officers)
- Full operational control of their barangay
- Access to all barangay features

---

### 3. Secretary
**Access Level:** Administrative and Documentation
- ✅ Dashboard - Overview of administrative tasks
- ✅ Residents - Manage resident records
- ✅ Documents - Manage all documents
- ✅ Clearances - Process clearance requests
- ❌ Blotter - No access (handled by Peace & Order)
- ❌ Financial - No access (handled by Treasurer)
- ✅ Reports - Generate administrative reports
- ✅ Settings - Personal and notification settings

**Special Permissions:**
- Can create Staff accounts
- Primary handler of documentation and clearances
- Administrative support to Barangay Captain

---

### 4. Treasurer
**Access Level:** Financial Management
- ✅ Dashboard - Financial overview
- ❌ Residents - No direct access (not primary responsibility)
- ❌ Documents - No access
- ❌ Clearances - No access
- ❌ Blotter - No access
- ✅ Financial - Full financial management
- ✅ Reports - Generate financial reports
- ✅ Settings - Personal settings

**Focus Areas:**
- Financial transactions
- Budget tracking
- Revenue and expense management
- Financial reporting

---

### 5. Staff
**Access Level:** General Administrative Support
- ✅ Dashboard - Overview of tasks
- ✅ Residents - Manage resident records
- ✅ Documents - Manage documents
- ✅ Clearances - Process clearance requests
- ❌ Blotter - No access
- ❌ Financial - No access
- ❌ Reports - No access (basic users)
- ✅ Settings - Personal settings

**Responsibilities:**
- Front desk operations
- Resident registration
- Document processing
- Clearance processing
- General administrative support

---

### 6. Peace & Order Officer
**Access Level:** Law Enforcement and Incident Management
- ✅ Dashboard - Incident overview
- ✅ Residents - View resident information
- ❌ Documents - No access
- ❌ Clearances - No access
- ✅ Blotter - Full blotter management
- ❌ Financial - No access
- ✅ Reports - Generate incident reports
- ✅ Settings - Personal settings

**Focus Areas:**
- Blotter record management
- Incident reporting
- Peace and order monitoring
- Law enforcement coordination

---

### 7. Health Officer
**Access Level:** Health Services and Programs
- ✅ Dashboard - Health program overview
- ✅ Residents - View and manage health records
- ✅ Documents - Manage health-related documents
- ❌ Clearances - No access
- ❌ Blotter - No access
- ❌ Financial - No access
- ✅ Reports - Generate health reports
- ✅ Settings - Personal settings

**Focus Areas:**
- Health programs and services
- Resident health monitoring
- Health document management
- Health-related reporting

---

### 8. Social Worker
**Access Level:** Social Services and Welfare
- ✅ Dashboard - Welfare program overview
- ✅ Residents - View and manage welfare records
- ✅ Documents - Manage social service documents
- ❌ Clearances - No access
- ❌ Blotter - No access
- ❌ Financial - No access
- ✅ Reports - Generate welfare reports
- ✅ Settings - Personal settings

**Focus Areas:**
- Social welfare programs
- Assistance programs
- Resident welfare monitoring
- Social service documentation

---

## Implementation Details

### Technical Implementation
The RBAC system is implemented in `/src/lib/rbac.ts` and includes:

1. **Role Definitions**: 8 distinct user roles
2. **Page Permissions**: Role-to-page access mapping
3. **Helper Functions**:
   - `hasPageAccess(role, pageId)` - Check if role can access page
   - `getAccessiblePages(role)` - Get all pages user can access
   - `getDefaultPage(role)` - Get default landing page for role
   - `formatRoleName(role)` - Format role name for display

### Navigation Behavior
- Sidebar menu automatically shows only accessible pages
- Attempting to access restricted page redirects to default page
- Each role has a default landing page (typically Dashboard)
- Users see only navigation items they can access

### Security Features
- Role-based page visibility
- Automatic redirect on unauthorized access
- Client-side and server-side permission checks
- Cookie-based role persistence

---

## Common Access Patterns

### Full Access (2 roles)
- Superadmin
- Barangay Captain

### Administrative Access (1 role)
- Secretary

### Specialized Access (5 roles)
- Treasurer (Financial focus)
- Peace & Order Officer (Blotter focus)
- Health Officer (Health focus)
- Social Worker (Welfare focus)
- Staff (General support)

---

## Permission Hierarchy

```
Level 1 (Highest): Superadmin
    ↓
Level 2: Barangay Captain
    ↓
Level 3: Secretary, Treasurer
    ↓
Level 4: Peace & Order Officer, Health Officer, Social Worker, Staff
```

---

## Future Enhancements

Potential improvements to the RBAC system:

1. **Granular Permissions**: Add action-level permissions (view, edit, delete)
2. **Dynamic Permissions**: Allow custom permission sets per user
3. **Role Hierarchy**: Implement permission inheritance
4. **Audit Logging**: Track page access and actions
5. **Time-based Access**: Temporary permissions or scheduled access
6. **Multi-role Support**: Allow users to have multiple roles

---

## Notes

- All roles have access to **Dashboard** and **Settings** (personal settings)
- **Superadmin** and **Barangay Captain** have identical page access but different user management permissions
- **Secretary** can assist with creating Staff accounts
- Specialized officers (Peace & Order, Health, Social Worker) have focused access relevant to their departments
- **Treasurer** has the most restricted access, focusing solely on financial matters

---

*Last Updated: October 31, 2025*
