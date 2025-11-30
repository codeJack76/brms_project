import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple query to check database connection
    const { error } = await supabase
      .from('barangays')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json(
        { status: 'error', service: 'database', error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      service: 'database',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', service: 'database', error: error.message },
      { status: 503 }
    );
  }
}
