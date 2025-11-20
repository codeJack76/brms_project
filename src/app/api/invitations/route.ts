// Invitation Management API
// POST: Create new invitation (superadmin/admin only)
// GET: Verify invitation code

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Generate 6-digit invitation code
function generateInviteCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// GET: Verify invitation code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }

    // Fetch invitation
    const { data: invitation, error } = await (supabaseAdmin
      .from('invitations') as any)
      .select('*')
      .eq('code', code)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (invitation.accepted) {
      return NextResponse.json(
        { error: 'This invitation has already been used' },
        { status: 400 }
      );
    }

    // Check if expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        barangay_id: invitation.barangay_id,
        expires_at: invitation.expires_at,
      },
    });

  } catch (error) {
    console.error('Invitation verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify invitation' },
      { status: 500 }
    );
  }
}

// POST: Create new invitation
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userEmail = request.cookies.get('user_email')?.value;
    const authToken = request.cookies.get('auth_token')?.value;

    if (!userEmail || !authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get current user to check permissions
    const { data: currentUser, error: userError } = await (supabaseAdmin
      .from('users') as any)
      .select('id, role, barangay_id')
      .eq('email', userEmail)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to create invitations
    const allowedRoles = ['superadmin', 'barangay_captain', 'secretary'];
    if (!allowedRoles.includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to create invitations' },
        { status: 403 }
      );
    }

    // For barangay_captain and secretary, verify their barangay is set up
    if (['barangay_captain', 'secretary'].includes(currentUser.role)) {
      if (!currentUser.barangay_id) {
        return NextResponse.json(
          { error: 'Please complete your barangay setup in Settings before inviting users' },
          { status: 403 }
        );
      }

      // Check if barangay exists
      const { data: barangay, error: barangayError } = await (supabaseAdmin
        .from('barangays') as any)
        .select('id, name')
        .eq('id', currentUser.barangay_id)
        .single();

      if (barangayError || !barangay) {
        return NextResponse.json(
          { error: 'Please complete your barangay information in Settings → General before inviting users' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { email, role, barangay_id } = body;

    // Validation
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Define what roles each user type can create
    // Superadmin: Can only create Barangay Captains (admins for each barangay)
    // Barangay Captain: Can create all members except superadmin and other captains
    // Secretary: Can create staff members only
    
    let allowedRolesToCreate: string[] = [];
    
    if (currentUser.role === 'superadmin') {
      allowedRolesToCreate = ['barangay_captain'];
    } else if (currentUser.role === 'barangay_captain') {
      allowedRolesToCreate = [
        'secretary',
        'treasurer',
        'staff',
        'peace_order_officer',
        'health_officer',
        'social_worker',
      ];
    } else if (currentUser.role === 'secretary') {
      allowedRolesToCreate = ['staff'];
    }

    // Check if the requested role is allowed
    if (!allowedRolesToCreate.includes(role)) {
      let errorMessage = 'You do not have permission to create this role';
      
      if (currentUser.role === 'superadmin') {
        errorMessage = 'Superadmin can only create Barangay Captains';
      } else if (currentUser.role === 'barangay_captain') {
        errorMessage = 'Barangay Captain cannot create superadmins or other captains';
      } else if (currentUser.role === 'secretary') {
        errorMessage = 'Secretary can only create staff members';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 403 }
      );
    }

    // Validate role exists in system
    const validRoles = [
      'superadmin',
      'barangay_captain',
      'secretary',
      'treasurer',
      'staff',
      'peace_order_officer',
      'health_officer',
      'social_worker',
    ];

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await (supabaseAdmin
      .from('users') as any)
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await (supabaseAdmin
      .from('invitations') as any)
      .select('id')
      .eq('email', email)
      .eq('accepted', false);

    if (existingInvite && existingInvite.length > 0) {
      return NextResponse.json(
        { error: 'An invitation for this email already exists' },
        { status: 409 }
      );
    }

    // Generate unique invitation code
    let code = generateInviteCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const { data: existing } = await (supabaseAdmin
        .from('invitations') as any)
        .select('id')
        .eq('code', code)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        code = generateInviteCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique code. Please try again.' },
        { status: 500 }
      );
    }

    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Determine barangay_id for the invitation
    // For barangay_captain and secretary: use their barangay_id
    // For superadmin: barangay_id is null (captain will set up their own barangay)
    let invitationBarangayId = null;
    if (currentUser.role === 'barangay_captain' || currentUser.role === 'secretary') {
      invitationBarangayId = currentUser.barangay_id;
    }

    // Create invitation
    const { data: invitation, error: createError } = await (supabaseAdmin
      .from('invitations') as any)
      .insert({
        email,
        code,
        role,
        barangay_id: invitationBarangayId,
        invited_by: currentUser.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating invitation:', createError);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        code: invitation.code,
        role: invitation.role,
        expires_at: invitation.expires_at,
      },
      message: 'Invitation created successfully',
    });

  } catch (error) {
    console.error('Invitation creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
