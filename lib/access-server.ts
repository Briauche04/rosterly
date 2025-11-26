import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export type AccessLevel = 'ADMIN' | 'MANAGER' | 'BASIC_PLUS' | 'BASIC2' | 'BASIC1' | 'BASIC' | null;

export async function getAccessLevelServer(): Promise<AccessLevel> {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: { get: (k) => cookieStore.get(k)?.value },
  });

  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return null;

  const { data, error } = await supabase.rpc('auth_access_level', { p_uid: u.user.id });
  if (error) return null;
  return (data as AccessLevel) ?? null;
}
