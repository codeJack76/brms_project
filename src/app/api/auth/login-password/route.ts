// Login API Route
// Handles email/password authentication with Auth0

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate with Auth0 using Resource Owner Password Grant
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
      const error = await tokenResponse.json();
      console.error('Auth0 token error:', error);
      return NextResponse.json(
        { error: error.error_description || 'Invalid email or password' },
        { status: 401 }
      );
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

    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get user information' },
        { status: 500 }
      );
    }

    const auth0User = await userInfoResponse.json();

    // Sync with backend database
    const syncResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0_id: auth0User.sub,
          email: auth0User.email,
          name: auth0User.name,
          picture: auth0User.picture,
          access_token: tokens.access_token,
        }),
      }
    );

    const syncData = await syncResponse.json();

    if (!syncResponse.ok) {
      return NextResponse.json(
        { error: syncData.error || 'Login failed' },
        { status: syncResponse.status }
      );
    }


    // Create response with cookies set
    const response = NextResponse.json({
      success: true,
      user: syncData.user,
    });

    // Set session cookies
    response.cookies.set('auth_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('user_email', auth0User.email, {
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
