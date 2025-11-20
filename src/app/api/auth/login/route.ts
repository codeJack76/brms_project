// Login Initiation API
// Redirects to Auth0 for authentication

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'login'; // 'login' or 'signup'

  const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`;

  if (!auth0Domain || !clientId) {
    return NextResponse.json(
      { error: 'Auth0 configuration missing' },
      { status: 500 }
    );
  }

  // Build Auth0 authorization URL
  const authUrl = new URL(`https://${auth0Domain}/authorize`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'openid profile email');
  
  // Set screen_hint to show signup or login screen
  if (mode === 'signup') {
    authUrl.searchParams.set('screen_hint', 'signup');
  }

  // Generate random state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
