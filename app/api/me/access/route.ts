export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: 'Missing env' }, { status: 500 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: { get: (k) => cookieStore.get(k)?.value },
  });

  const { data: u, error: uErr } = await supabase.auth.getUser();
  if (uErr || !u?.user) return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });

  const { data, error } = await supabase.rpc('auth_access_level', { p_uid: u.user.id });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, accessLevel: data });
}