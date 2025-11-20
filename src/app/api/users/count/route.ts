import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { count, error } = await (supabaseAdmin
      .from('users') as any)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting users:', error);
      return NextResponse.json(
        { error: 'Failed to count users', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Error counting users:', error);
    return NextResponse.json(
      { error: 'Failed to count users' },
      { status: 500 }
    );
  }
}
