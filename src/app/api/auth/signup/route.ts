// Signup API Route
// Creates Auth0 user account and syncs with Supabase using invitation

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, inviteCode } = body;

    console.log('Signup attempt:', { email, hasPassword: !!password, name, hasInviteCode: !!inviteCode });

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if this is the first user
    let isFirstUser = false;
    try {
      const checkUsersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users/count`,
        { cache: 'no-store' }
      );
      
      if (checkUsersResponse.ok) {
        const usersData = await checkUsersResponse.json();
        isFirstUser = usersData.count === 0;
        console.log('User count check:', { count: usersData.count, isFirstUser });
      } else {
        console.error('Failed to check user count, assuming not first user');
      }
    } catch (error) {
      console.error('Error checking user count:', error);
      // If we can't check, assume not first user and require invitation
    }

    // If not first user, require invitation code
    if (!isFirstUser && !inviteCode) {
      console.log('Not first user and no invite code provided');
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }

    // Verify invitation code (skip for first user)
    let inviteData = null;
    if (!isFirstUser) {
      const inviteResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invitations?code=${inviteCode}`
      );
      inviteData = await inviteResponse.json();

      if (!inviteResponse.ok) {
        return NextResponse.json(
          { error: inviteData.error || 'Invalid invitation code' },
          { status: 400 }
        );
      }

      // Verify email matches invitation
      if (inviteData.invitation.email !== email) {
        return NextResponse.json(
          { error: 'Email does not match invitation' },
          { status: 400 }
        );
      }
    }

    // Create user in Auth0 database
    console.log('Attempting Auth0 signup for:', email);
    const signupResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/dbconnections/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
          email,
          password,
          name,
          connection: 'Username-Password-Authentication',
        }),
      }
    );

    if (!signupResponse.ok) {
      const error = await signupResponse.json();
      console.error('Auth0 signup error:', error);
      
      // Check if user already exists
      if (error.code === 'invalid_signup' || error.message?.includes('already exists')) {
        return NextResponse.json(
          { 
            error: 'An account with this email already exists. Please use a different email or try logging in.',
            code: 'user_exists'
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.description || error.message || 'Failed to create account in Auth0.' },
        { status: 400 }
      );
    }

    const auth0User = await signupResponse.json();
    console.log('Auth0 user created successfully:', auth0User._id);

    // Now authenticate to get tokens
    const tokenResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
          realm: 'Username-Password-Authentication',
          username: email,
          password: password,
          client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          scope: 'openid profile email',
        }),
      }
    );

    if (!tokenResponse.ok) {
      // User created but couldn't get token - still return success
      return NextResponse.json({
        success: true,
        message: 'Account created. Please log in.',
      });
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const userInfo = await userInfoResponse.json();

    // If the invitation is for a barangay_captain, create a new barangay first
    let barangayId = null;
    
    console.log('Invite data structure:', JSON.stringify(inviteData, null, 2));
    
    // Extract role and barangay_id from invitation
    const invitationRole = inviteData?.invitation?.role;
    const invitationBarangayId = inviteData?.invitation?.barangay_id;
    
    console.log('Checking if captain needs barangay:', { 
      role: invitationRole, 
      hasBarangayId: !!invitationBarangayId,
      isFirstUser
    });
    
    // Create barangay for captain if they don't have one
    if (invitationRole === 'barangay_captain' && !invitationBarangayId) {
      // Create a new barangay for this captain
      console.log('Creating barangay for captain:', { email, name });
      
      try {
        const barangayResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/barangays/create-for-captain`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              captainEmail: email,
              captainName: name,
            }),
          }
        );

        if (barangayResponse.ok) {
          const barangayData = await barangayResponse.json();
          barangayId = barangayData.barangay.id;
          console.log('Barangay created successfully:', barangayId);
        } else {
          const errorText = await barangayResponse.text();
          console.error('Failed to create barangay:', errorText);
        }
      } catch (error) {
        console.error('Error creating barangay:', error);
      }
    } else if (invitationBarangayId) {
      barangayId = invitationBarangayId;
      console.log('Using existing barangay from invitation:', barangayId);
    }

    // Sync with Supabase
    const syncResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0_id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          access_token: tokens.access_token,
          barangay_id_override: barangayId, // Pass the barangay ID
        }),
      }
    );

    const syncData = await syncResponse.json();

    if (!syncResponse.ok) {
      console.error('Sync error:', syncData);
      // User created in Auth0 but sync failed
      return NextResponse.json({
        success: true,
        warning: 'Account created but sync failed. Please contact administrator.',
      });
    }

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      user: syncData.user,
    });

    // Set session cookies
    response.cookies.set('auth_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('user_email', email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('user_role', syncData.user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
