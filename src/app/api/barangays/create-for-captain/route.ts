import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST - Create a new barangay for a barangay captain during signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { captainEmail, captainName } = body;

    if (!captainEmail || !captainName) {
      return NextResponse.json(
        { error: 'Captain email and name are required' },
        { status: 400 }
      );
    }

    // Extract first name from full name for barangay placeholder
    const firstName = captainName.split(' ')[0];

    // Create a placeholder barangay for this captain
    const { data, error } = await supabaseAdmin
      .from('barangays')
      .insert({
        name: `Barangay of ${firstName}`,
        municipality: 'To be configured',
        province: 'To be configured',
        email: captainEmail,
        address: 'Please update barangay information in Settings'
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating barangay:', error);
      return NextResponse.json(
        { error: 'Failed to create barangay' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Barangay created successfully',
      barangay: data,
      requiresSetup: true
    });
  } catch (error) {
    console.error('POST /api/barangays/create-for-captain error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
