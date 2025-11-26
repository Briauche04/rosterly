export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anon || !service) {
    return NextResponse.json({ ok: false, reason: 'Missing env(s)', has: { url: !!url, anon: !!anon, service: !!service } }, { status: 500 });
  }

  try {
    const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
    // lightweight admin call; will fail if key invalid/wrong project
    const list = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (list.error) throw list.error;

    return NextResponse.json({
      ok: true,
      projectRef: new URL(url).host.split('.')[0],
      usersSampleCount: list.data?.users?.length ?? 0,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, reason: e?.message ?? 'admin call failed' }, { status: 500 });
  }
}
