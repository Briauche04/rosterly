'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { dayOrder } from '@/lib/week';

type DayRow = { day: string; selection: string };
type SubRow = {
  id: string;
  week_start: string;
  employee_id: string;
  submitted_at: string | null;
  notes: string | null;
  decision?: string | null;
  status?: string | null;
};
type EmpRow = { id: string; display_name: string | null };

export default function ManagerSubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sub, setSub] = useState<SubRow | null>(null);
  const [emp, setEmp] = useState<EmpRow | null>(null);
  const [days, setDays] = useState<DayRow[]>([]);
  const [comment, setComment] = useState('');

  const decision = useMemo(() => {
    if (!sub) return 'pending';
    return (sub.decision ?? sub.status ?? 'pending') as 'pending'|'approved'|'rejected';
  }, [sub]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg('');

      // auth
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { router.replace('/auth'); return; }

      // role check
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role_id, roles(code)')
        .eq('user_id', u.user.id);
      const isManager = roles?.some(r => r.roles?.code === 'manager');
      if (!isManager) { setMsg('אין הרשאת מנהל'); setLoading(false); return; }

      // submission (no join, RLS-safe)
      const { data: s, error: subErr } = await supabase
        .from('submissions')
        .select('id, week_start, employee_id, submitted_at, notes, decision, status')
        .eq('id', id)
        .single();
      if (subErr || !s) { setMsg('לא נמצאה בקשה'); setLoading(false); return; }
      setSub(s);

      // employee
      const { data: e } = await supabase
        .from('employees')
        .select('id, display_name')
        .eq('id', s.employee_id)
        .maybeSingle();
      setEmp(e ?? null);

      // days
      const { data: d } = await supabase
        .from('submission_days')
        .select('day, selection')
        .eq('submission_id', s.id)
        .order('day');
      setDays(d ?? []);

      setLoading(false);
    })();
  }, [id, router]);

  async function setVerdict(v: 'approved'|'rejected') {
    // try decision; fallback to status
    const upd = { decision: v, reviewed_at: new Date().toISOString() } as any;
    let { error } = await supabase.from('submissions').update(upd).eq('id', id);
    if (error) {
      const { error: e2 } = await supabase
        .from('submissions').update({ status: v, reviewed_at: new Date().toISOString() }).eq('id', id);
      if (e2) { alert('עדכון סטטוס נכשל'); return; }
    }
    setSub(prev => prev ? { ...prev, decision: v, status: v } : prev);
  }

  async function sendComment() {
    if (!comment.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    const managerId = u.user?.id;
    const { error } = await supabase
      .from('submission_comments')
      .insert({ submission_id: id, manager_id: managerId, body: comment.trim() });
    if (error) { alert('שמירת הערה נכשלה'); return; }
    setComment('');
    // optional: reload comments list (shown below)
    await loadComments();
  }

  const [comments, setComments] = useState<Array<{id:string; body:string; created_at:string; manager_id:string}>>([]);
  async function loadComments() {
    const { data } = await supabase
      .from('submission_comments')
      .select('id, body, created_at, manager_id')
      .eq('submission_id', id)
      .order('created_at', { ascending: false });
    setComments(data ?? []);
  }
  useEffect(() => { if (id) loadComments(); }, [id]);

  function heDay(k: string) {
    // dayOrder has { key:'sun'|'mon'... , he:'ראשון'... }
    return dayOrder.find(d => d.key === k)?.he ?? k;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">🗂 פרטי בקשה</h1>
          <button className="rounded bg-gray-200 px-3 py-1" onClick={() => router.push('/manager')}>
            חזרה
          </button>
        </div>

        {loading && <p>טוען…</p>}
        {!loading && msg && <p className="text-red-600">{msg}</p>}

        {!loading && !msg && sub && (
          <>
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded border p-3">
                <div className="text-sm text-gray-500">עובד</div>
                <div className="font-semibold">{emp?.display_name ?? '—'}</div>
              </div>
              <div className="rounded border p-3">
                <div className="text-sm text-gray-500">שבוע מתחיל</div>
                <div className="font-semibold">{sub.week_start}</div>
              </div>
              <div className="rounded border p-3">
                <div className="text-sm text-gray-500">סטטוס</div>
                <span className={`font-semibold ${
                  decision==='approved' ? 'text-green-700' :
                  decision==='rejected' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {decision==='approved' ? 'אושר' : decision==='rejected' ? 'נדחה' : 'ממתין'}
                </span>
              </div>
            </div>

            {sub.notes && (
              <div className="mb-4 rounded border p-3">
                <div className="text-sm text-gray-500">הערות העובד</div>
                <div>{sub.notes}</div>
              </div>
            )}

            {/* Week grid */}
            <div className="mb-6 rounded border p-3">
              <h2 className="mb-3 text-lg font-semibold">תצוגת שבוע</h2>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
                {dayOrder.map(d => {
                  const sel = days.find(x => x.day === d.key)?.selection ?? '—';
                  return (
                    <div key={d.key} className="rounded bg-gray-50 p-3 text-center shadow-sm">
                      <div className="text-sm text-gray-600">{d.he}</div>
                      <div className="mt-1 font-semibold">{sel}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex flex-wrap gap-2">
              {decision === 'pending' && (
                <>
                  <button
                    onClick={() => setVerdict('approved')}
                    className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                  >
                    אשר
                  </button>
                  <button
                    onClick={() => setVerdict('rejected')}
                    className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                  >
                    דחה
                  </button>
                </>
              )}
            </div>

            {/* Manager comments */}
            <div className="rounded border p-3">
              <h2 className="mb-3 text-lg font-semibold">הערות מנהל</h2>
              <div className="mb-3 flex gap-2">
                <input
                  value={comment}
                  onChange={e=>setComment(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="כתוב הערה לעובד…"
                />
                <button
                  onClick={sendComment}
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  שלח
                </button>
              </div>
              <div className="space-y-2">
                {comments.map(c => (
                  <div key={c.id} className="rounded bg-gray-50 p-2 text-sm">
                    <div className="text-gray-500">
                      {new Date(c.created_at).toLocaleString('he-IL')}
                    </div>
                    <div>{c.body}</div>
                  </div>
                ))}
                {comments.length===0 && <div className="text-sm text-gray-500">אין הערות</div>}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
