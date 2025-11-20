// User Sync API
// Syncs Auth0 user to Supabase database

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth0_id, email, name, picture, access_token, barangay_id_override } = body;

    console.log('Sync request received:', { 
      email, 
      auth0_id: auth0_id?.substring(0, 10) + '...', 
      barangay_id_override,
      hasBarangayOverride: !!barangay_id_override
    });

    if (!auth0_id || !email) {
      return NextResponse.json(
        { error: 'auth0_id and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await (supabaseAdmin
      .from('users') as any)
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is okay
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    let user;

    if (existingUser) {
      // Update existing user with Auth0 data
      const { data: updatedUser, error: updateError } = await (supabaseAdmin
        .from('users') as any)
        .update({
          name: name || existingUser.name,
          metadata: {
            ...(existingUser.metadata || {}),
            auth0_id,
            picture,
            last_login: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }

      user = updatedUser;
    } else {
      // New user - check if this is the first user (should become superadmin)
      const { count, error: countError } = await (supabaseAdmin
        .from('users') as any)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error counting users:', countError);
      }

      const isFirstUser = count === 0 || count === null;

      let userRole = 'staff';
      let userBarangayId = null;

      if (isFirstUser) {
        // First user becomes superadmin (no invitation needed)
        userRole = 'superadmin';
        userBarangayId = null; // Superadmin doesn't need a barangay
      } else {
        // Check if they have an invitation
        const { data: invitation, error: inviteError } = await (supabaseAdmin
          .from('invitations') as any)
          .select('*')
          .eq('email', email)
          .eq('accepted', false)
          .single();

        if (inviteError && inviteError.code !== 'PGRST116') {
          console.error('Error checking invitation:', inviteError);
        }

        // If no invitation found, user cannot sign up
        if (!invitation) {
          return NextResponse.json(
            { 
              error: 'No invitation found for this email. Please contact an administrator.',
              needsInvitation: true,
            },
            { status: 403 }
          );
        }

        userRole = invitation.role;
        userBarangayId = barangay_id_override || invitation.barangay_id;

        // Mark invitation as accepted
        await (supabaseAdmin
          .from('invitations') as any)
          .update({
            accepted: true,
            accepted_at: new Date().toISOString(),
          })
          .eq('id', invitation.id);
      }

      // Create new user
      const { data: newUser, error: createError } = await (supabaseAdmin
        .from('users') as any)
        .insert({
          email,
          name,
          role: userRole,
          barangay_id: userBarangayId,
          metadata: {
            auth0_id,
            picture,
            invited_by: isFirstUser ? null : undefined,
            created_via: 'auth0',
            is_first_user: isFirstUser,
          },
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      user = newUser;
    }

    // Create response with session cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        barangay_id: user.barangay_id,
      },
    });

    // Set session cookies if access_token provided
    if (access_token) {
      response.cookies.set('auth_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      response.cookies.set('user_email', email, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      response.cookies.set('user_role', user.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
