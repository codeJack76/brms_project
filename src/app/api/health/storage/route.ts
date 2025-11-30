import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function GET() {
  try {
    // Just check if Supabase URL is configured and reachable
    if (!supabaseUrl) {
      return NextResponse.json(
        { status: 'error', service: 'storage', error: 'Storage not configured' },
        { status: 503 }
      );
    }

    // Ping Supabase storage endpoint
    const response = await fetch(`${supabaseUrl}/storage/v1/`, {
      method: 'HEAD',
      cache: 'no-store',
    });

    // Any response (even 400/401) means storage service is reachable
    return NextResponse.json({
      status: 'ok',
      service: 'storage',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', service: 'storage', error: error.message },
      { status: 503 }
    );
  }
}
