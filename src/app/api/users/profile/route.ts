import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// GET - Fetch current user's profile
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('user_email')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, barangay_id, is_active, metadata, created_at')
      .eq('email', userEmail)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('GET profile error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('user_email')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, metadata } = body;

    // Get current user
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, metadata')
      .eq('email', userEmail)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Merge existing metadata with new metadata
    const updatedMetadata = {
      ...(currentUser.metadata || {}),
      ...(metadata || {}),
    };

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        name: name || undefined,
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUser.id)
      .select('id, email, name, role, barangay_id, is_active, metadata, created_at')
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('PUT profile error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
