import { createClient } from '@supabase/supabase-js';

// ✅ Create the Supabase client using environment variables
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🪄 Log info during development to confirm the client is configured
if (process.env.NODE_ENV === 'development') {
  console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE KEY loaded:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// 🧪 Debug helper — expose supabase client globally in browser console
if (typeof window !== 'undefined') {
  // @ts-expect-error debug helper
  window.supabase = supabase;
}
