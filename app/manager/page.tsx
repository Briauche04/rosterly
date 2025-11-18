'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type SubmissionRow = {
  id: string;
  week_start: string;
  status: 'pending' | 'approved' | 'rejected' | 'late';
  notes: string | null;
  employee: { display_name: string | null } | null; // ← renamed to employee
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [subs, setSubs] = useState<SubmissionRow[]>([]);
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // require auth
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        router.replace('/auth');
        return;
      }

      // require manager role
      const { data: roles, error: roleErr } = await supabase
        .from('user_roles')
        .select('roles(code)')
        .eq('user_id', u.user.id);

      if (roleErr) {
        console.error('Role check error:', roleErr);
        setMsg('שגיאה בבדיקת הרשאה');
        setLoading(false);
        return;
      }

      const isManager = roles?.some(r => r.roles?.code === 'manager');
      if (!isManager) {
        setMsg('אין הרשאת מנהל');
        setLoading(false);
        return;
      }

      // load submissions — disambiguate the join using the FK name
      // FK should be named "submissions_employee_id_fkey" (default if you created it normally)
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          week_start,
          status,
          notes,
          employee:employees!submissions_employee_id_fkey(display_name)
        `)
        .order('week_start', { ascending: false });

      if (error) {
        console.error('Load submissions error:', error);
        setMsg('שגיאה בטעינת נתונים');
      } else {
        setSubs((data ?? []) as SubmissionRow[]);
      }
      setLoading(false);
    })();
  }, [router]);

  async function approve(id: string) {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      console.error('Approve error:', error);
      setMsg('שגיאה בעדכון סטטוס');
      return;
    }
    setSubs(prev => prev.map(s => (s.id === id ? { ...s, status: 'approved' } : s)));
  }

  async function reject(id: string) {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      console.error('Reject error:', error);
      setMsg('שגיאה בעדכון סטטוס');
      return;
    }
    setSubs(prev => prev.map(s => (s.id === id ? { ...s, status: 'rejected' } : s)));
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">📊 לוח מנהלים</h1>
          <div className="flex gap-2">
            <Link
              href="/manager/generate"
              className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            >
              יצירת סידור
            </Link>
            <Link
              href="/dashboard"
              className="rounded bg-gray-200 px-3 py-2 text-gray-800 hover:bg-gray-300"
            >
              חזרה לדאשבורד
            </Link>
          </div>
        </div>

        {loading && <p>טוען…</p>}
        {!loading && msg && <p className="text-center text-red-600">{msg}</p>}

        {!loading && !msg && (
          <div className="space-y-3">
            {subs.map(s => (
              <div key={s.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {s.employee?.display_name || '—'} — שבוע: {s.week_start}
                    </div>
                    <div className="text-sm">
                      סטטוס: <strong>{s.status}</strong>
                    </div>
                    <div className="text-sm">הערות: {s.notes || '-'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/manager/${s.id}`}
                      className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                    >
                      פרטים
                    </Link>
                    {s.status !== 'approved' && (
                      <button
                        onClick={() => approve(s.id)}
                        className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
                      >
                        אשר
                      </button>
                    )}
                    {s.status !== 'rejected' && (
                      <button
                        onClick={() => reject(s.id)}
                        className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      >
                        דחה
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {subs.length === 0 && (
              <p className="text-center text-sm text-gray-600">אין הגשות להצגה.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

