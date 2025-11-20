import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST - Assign or create barangay for a captain who doesn't have one
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { captainEmail } = body;

    if (!captainEmail) {
      return NextResponse.json(
        { error: 'Captain email is required' },
        { status: 400 }
      );
    }

    // Get the captain's user record
    const { data: captain, error: captainError } = await (supabaseAdmin
      .from('users') as any)
      .select('*')
      .eq('email', captainEmail)
      .eq('role', 'barangay_captain')
      .single();

    if (captainError || !captain) {
      return NextResponse.json(
        { error: 'Captain not found or not a barangay_captain role' },
        { status: 404 }
      );
    }

    // Check if captain already has a barangay
    if (captain.barangay_id) {
      return NextResponse.json(
        { 
          message: 'Captain already has a barangay assigned',
          barangay_id: captain.barangay_id
        }
      );
    }

    // Create a new barangay for this captain
    const firstName = captain.name.split(' ')[0];
    const { data: barangay, error: barangayError } = await (supabaseAdmin
      .from('barangays') as any)
      .insert({
        name: `Barangay of ${firstName}`,
        municipality: 'To be configured',
        province: 'To be configured',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (barangayError) {
      console.error('Error creating barangay:', barangayError);
      return NextResponse.json(
        { error: 'Failed to create barangay' },
        { status: 500 }
      );
    }

    // Update captain's record with the new barangay_id
    const { error: updateError } = await (supabaseAdmin
      .from('users') as any)
      .update({ barangay_id: barangay.id })
      .eq('id', captain.id);

    if (updateError) {
      console.error('Error updating captain:', updateError);
      return NextResponse.json(
        { error: 'Failed to assign barangay to captain' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Barangay created and assigned to captain',
      barangay,
      requiresSetup: true,
    });

  } catch (error) {
    console.error('Error assigning barangay to captain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
