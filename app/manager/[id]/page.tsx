// app/manager/[id]/page.tsx
// Replace ONLY the role-check block with the following:

// role check (manager OR admin)
const { data: rolesData, error: roleErr } = await supabase
  .from('user_roles')
  .select('role_code')                 // ✅ correct column
  .eq('user_uid', u.user.id);          // ✅ correct column

if (roleErr) {
  setMsg('שגיאה בבדיקת הרשאה');
  setLoading(false);
  return;
}

const isManager = (rolesData ?? []).some(
  (r: any) => r.role_code === 'manager' || r.role_code === 'admin'
);
if (!isManager) {
  setMsg('אין הרשאת מנהל');
  setLoading(false);
  return;
}
