import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;

export async function GET() {
  try {
    if (!auth0Domain) {
      return NextResponse.json(
        { status: 'error', service: 'auth', error: 'Auth0 not configured' },
        { status: 503 }
      );
    }

    // Check Auth0 availability
    const response = await fetch(`https://${auth0Domain}/.well-known/openid-configuration`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', service: 'auth', error: 'Auth0 unreachable' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      service: 'auth',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', service: 'auth', error: error.message },
      { status: 503 }
    );
  }
}
