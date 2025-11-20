// Logout API
// Clears session and redirects to Auth0 logout

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const returnTo = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`;

  // Clear session cookies
  const response = NextResponse.redirect(
    `https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(returnTo)}`
  );

  response.cookies.delete('auth_token');
  response.cookies.delete('user_email');
  response.cookies.delete('user_role');

  return response;
}

export async function POST(request: NextRequest) {
  // Also support POST for logout
  return GET(request);
}
