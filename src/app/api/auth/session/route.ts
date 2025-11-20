// Get Current User Session API
// Returns the currently authenticated user from cookies

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('user_email')?.value;
    const authToken = request.cookies.get('auth_token')?.value;

    if (!userEmail || !authToken) {
      return NextResponse.json(
        { error: 'Not authenticated', authenticated: false },
        { status: 401 }
      );
    }

    // Fetch full user data from Supabase
    console.log('GET /api/auth/session - Fetching user for email:', userEmail);
    
    const { data: user, error } = await (supabaseAdmin
      .from('users') as any)
      .select('id, email, name, role, barangay_id, is_active, metadata')
      .eq('email', userEmail)
      .single();

    console.log('User data from DB:', user);
    console.log('User barangay_id:', user?.barangay_id);

    if (error || !user) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: 'User not found', authenticated: false },
        { status: 404 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive', authenticated: false },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        barangay_id: user.barangay_id,
        picture: user.metadata?.picture,
      },
    });

  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Session error', authenticated: false },
      { status: 500 }
    );
  }
}
