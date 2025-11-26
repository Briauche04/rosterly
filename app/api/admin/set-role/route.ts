export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function jerr(status: number, msg: string, extra?: unknown) {
  console.error('[set-role]', msg, extra ?? '');
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = await cookies();
  const userClient = createServerClient(url, anon, { cookies: { get: (k) => cookieStore.get(k)?.value } });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return jerr(401, 'Unauthenticated');
  const { data: lvl } = await userClient.rpc('auth_access_level', { p_uid: u.user.id });
  if (lvl !== 'ADMIN') return jerr(403, 'Only ADMIN can set roles');

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const { user_uid, role_code } = await req.json() as { user_uid: string; role_code: string };
    if (!user_uid || !role_code) return jerr(400, 'Missing user_uid/role_code');

    // ensure the role_code exists in role_access_map
    const exists = await admin.from('role_access_map').select('role_code').eq('role_code', role_code).maybeSingle();
    if (exists.error || !exists.data) return jerr(400, 'Unknown role_code');

    // upsert single row (replace whatever is there)
    const del = await admin.from('user_roles').delete().eq('user_uid', user_uid);
    if (del.error) return jerr(400, del.error.message);

    const ins = await admin.from('user_roles').insert({ user_uid, role_code });
    if (ins.error) return jerr(400, ins.error.message);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return jerr(500, e?.message ?? 'Server error', e);
  }
}