// app/api/admin/create-employee/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

type AccessLevel = 'ADMIN'|'MANAGER'|'BASIC_PLUS'|'BASIC2'|'BASIC1'|'BASIC'|null;

function digitsOnly(s: string) { return (s || '').replace(/\D/g, ''); }
function idToEmail(id: string) { return `${id}@rosterly.local`; }
function bad(status: number, msg: string, extra?: unknown) {
  if (extra) console.error('[create-employee]', msg, extra);
  return NextResponse.json({ ok: false, error: msg }, { status });
}

// Use Authorization header if present, else fallback to Supabase cookie
function extractAccessToken(req: Request, projectUrl: string): string | null {
  const h = req.headers.get('authorization') || req.headers.get('Authorization');
  if (h?.toLowerCase().startsWith('bearer ')) return h.slice(7).trim();
  try {
    const projectRef = new URL(projectUrl).host.split('.')[0];
    const name = `sb-${projectRef}-auth-token`;
    const raw = cookies().get(name)?.value;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !anon || !service) return bad(500, 'Missing Supabase env');

  const token = extractAccessToken(req, url);
  if (!token) return bad(401, 'Unauthenticated');

  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: me, error: meErr } = await userClient.auth.getUser();
  if (meErr || !me?.user) return bad(401, 'Unauthenticated');

  // Only ADMIN may create Auth + employee
  const { data: level, error: lvlErr } = await userClient.rpc('auth_access_level', { p_uid: me.user.id });
  if (lvlErr) return bad(500, 'Access check failed', lvlErr.message);
  if (level !== 'ADMIN') return bad(403, 'Only ADMIN can create employees');

  type Body = {
    full_name: string;
    id_number: string;
    phone?: string;
    role?: string;
    role_code: string;
    hired_date?: string | null; // YYYY-MM-DD
    active?: boolean;
    global_worker?: boolean;
  };
  const body = await req.json().catch(() => null) as Body | null;
  if (!body) return bad(400, 'Invalid JSON body');

  const id_number = (body.id_number || '').trim();
  const full_name = (body.full_name || '').trim();
  const phoneRaw  = (body.phone || '').trim();
  const phoneDigits = digitsOnly(phoneRaw);
  const role_code = (body.role_code || '').trim();
  const role      = body.role ?? null;

  if (!id_number) return bad(400, 'id_number required');
  if (!full_name) return bad(400, 'full_name required');
  if (!role_code) return bad(400, 'role_code required');
  if (phoneDigits.length < 6) return bad(400, 'phone (digits) must be at least 6');

  const allowedRoleCodes = new Set([
    'store_manager','assistant_op_manager','assistant_manager',
    'head_cashier','key_holder','warehouse_keeper','cashier','seller',
    'manager','admin', // if you also store these sometimes
  ]);
  if (!allowedRoleCodes.has(role_code)) return bad(400, `Invalid role_code: ${role_code}`);

  const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

  // Step 1: ensure an Auth user exists for this ID (email = id@rosterly.local)
  const email = idToEmail(id_number);
  let uid: string | null = null;

  // Try create; if duplicate, reuse existing user
  const createRes = await admin.auth.admin.createUser({
    email,
    password: phoneDigits,
    email_confirm: true,
    user_metadata: { national_id: id_number, phone: phoneRaw, full_name },
  });

  if (createRes.error) {
    // If email already exists, reuse that UID; else bubble error
    if (/already registered|email.*exists|duplicate/i.test(createRes.error.message)) {
      const existing = await admin.auth.admin.getUserByEmail(email);
      if (existing.error || !existing.data?.user?.id) {
        return bad(400, `Auth lookup failed: ${existing.error?.message || 'no user found'}`);
      }
      uid = existing.data.user.id;
    } else {
      return bad(400, `Auth create failed: ${createRes.error.message}`);
    }
  } else {
    uid = createRes.data.user?.id ?? null;
  }

  if (!uid) return bad(500, 'Auth user id missing after create/lookup');

  // Step 2/3: upsert employees + user_roles
  try {
    // Ensure unique id_number in employees, and link to uid
    const emp = await admin
      .from('employees')
      .upsert({
        user_uid: uid,
        id_number,
        full_name,
        phone: phoneRaw || null,
        role,
        active: body.active ?? true,
        global_worker: body.global_worker ?? false,
        hired_date: body.hired_date ?? null,
      }, { onConflict: 'id_number' })
      .select('id, full_name, id_number, phone, role, active, global_worker, hired_date')
      .single();
    if (emp.error) throw new Error(emp.error.message);

    // Give the access role if it’s not already present
    const roleInsert = await admin
      .from('user_roles')
      .upsert({ user_uid: uid, role_code }, { onConflict: 'user_uid,role_code' })
      .select('user_uid, role_code')
      .single();
    if (roleInsert.error) throw new Error(roleInsert.error.message);

    return NextResponse.json({
      ok: true,
      auth: { uid, email },
      employee: emp.data,
      user_role: roleInsert.data,
    });
  } catch (e: any) {
    return bad(400, e?.message || 'Failed to write employee/role');
  }
}
