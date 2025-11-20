// Server-side Supabase Client
// Use this in API routes and server-side code with service_role key

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
}

if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
  console.error('📋 Instructions:');
  console.error('1. Go to https://supabase.com/dashboard → your project → Settings → API');
  console.error('2. Copy the service_role key');
  console.error('3. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=<paste-key-here>');
  console.error('4. Restart the dev server');
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Check server console for details.'
  );
}

// Create a supabase client with service_role key
// This bypasses Row Level Security - use with caution!
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public'
    }
  }
);

// Export types
export type { Database } from './database.types';
