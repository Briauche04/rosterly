import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('user_roles').select('role_code')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const roles = (data ?? []).map(r => r.role_code)
  const isManager = roles.includes('manager') || roles.includes('admin')
  return NextResponse.json({ roles, isManager })
}
