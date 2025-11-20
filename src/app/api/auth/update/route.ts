import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// PUT - Update user information
export async function PUT(request: NextRequest) {
  try {
    // Get user email from cookies
    const cookieStore = request.cookies;
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { barangay_id } = body;

    console.log('PUT /api/auth/update - User:', userEmail, 'Barangay ID:', barangay_id);

    if (!barangay_id) {
      return NextResponse.json(
        { error: 'Barangay ID is required' },
        { status: 400 }
      );
    }

    // Update user's barangay_id
    const { data, error } = await (supabaseAdmin
      .from('users') as any)
      .update({
        barangay_id,
        updated_at: new Date().toISOString(),
      })
      .eq('email', userEmail)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    console.log('User updated successfully:', data);

    return NextResponse.json({
      success: true,
      user: data,
    });

  } catch (error) {
    console.error('Error in update route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
