export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function jerr(status: number, msg: string, extra?: unknown) {
  console.error('[reset-password]', msg, extra ?? '');
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
  if (lvl !== 'ADMIN') return jerr(403, 'Only ADMIN can reset passwords');

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  try {
    const { user_uid } = await req.json() as { user_uid: string };
    if (!user_uid) return jerr(400, 'Missing user_uid');

    // fetch phone from employees
    const { data: emp, error } = await admin.from('employees').select('phone').eq('user_uid', user_uid).single();
    if (error || !emp?.phone) return jerr(400, 'Employee not found or missing phone');

    const newPassword = emp.phone;
    const { error: upErr } = await admin.auth.admin.updateUserById(user_uid, { password: newPassword });
    if (upErr) return jerr(400, upErr.message);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return jerr(500, e?.message ?? 'Server error', e);
  }
}