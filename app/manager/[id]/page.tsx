// app/manager/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Submission = {
  id: string;
  status: string | null;
  week_start: string;
  employee_id: string;
};

type Employee = {
  id: string;
  full_name: string | null;
  role: string | null;
};

export default function ManagerSubmissionDetails() {
  const { id } = useParams<{ id: string }>(); // submission id
  const router = useRouter();

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [sub, setSub] = useState<Submission | null>(null);
  const [emp, setEmp] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      // gate: require MANAGER or ADMIN
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { setAllowed(false); setLoading(false); return; }

      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('role_code')
        .eq('user_uid', u.user.id);

      if (rErr || !roles) { setErr('שגיאת הרשאות'); setLoading(false); return; }

      const isMgr = roles.some(r => r.role_code === 'manager' || r.role_code === 'admin');
      if (!isMgr) { setAllowed(false); setLoading(false); return; }
      setAllowed(true);

      // load submission + employee
      const { data: s, error: sErr } = await supabase
        .from('submissions')
        .select('id, status, week_start, employee_id')
        .eq('id', id)
        .maybeSingle();

      if (sErr || !s) { setErr('לא נמצאה הגשה'); setLoading(false); return; }
      setSub(s);

      const { data: e, error: eErr } = await supabase
        .from('employees')
        .select('id, full_name, role')
        .eq('id', s.employee_id)
        .maybeSingle();

      if (eErr) { setErr('שגיאה בטעינת עובד'); setLoading(false); return; }
      setEmp(e ?? null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <main className="landing-main" dir="rtl"><p>טוען…</p></main>;
  if (allowed === false) return <main className="landing-main" dir="rtl"><h3>אין לך הרשאות מנהל</h3></main>;
  if (err) return <main className="landing-main" dir="rtl"><p>{err}</p></main>;
  if (!sub) return <main className="landing-main" dir="rtl"><p>לא נמצאה הגשה</p></main>;

  return (
    <main className="landing-main" dir="rtl">
      <img src="/logo.png" alt="Rosterly" className="logo" />
      <h2>פרטי הגשה</h2>
      <section className="landing-cards" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="landing-card">
          <div className="landing-card-top">
            <span className="btn pill">מס׳ הגשה</span>
          </div>
          <div className="landing-card-bottom" style={{ lineHeight: 1.8 }}>
            <div><b>ID:</b> {sub.id}</div>
            <div><b>עובד/ת:</b> {emp?.full_name ?? '—'} ({emp?.role ?? '—'})</div>
            <div><b>שבוע:</b> {sub.week_start}</div>
            <div><b>סטטוס:</b> {sub.status ?? 'pending'}</div>
          </div>
        </div>
        <button className="btn" onClick={() => router.push('/manager/submissions')}>חזרה לרשימת הגשות</button>
      </section>
    </main>
  );
}
