'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { dayOrder } from '@/lib/week';

type TotalsRow = {
  day: string;            // 'sun'..'sat'
  total_hours: number;    // current placed (0 for draft)
  forecast_sales: number; // from forecast
  productivity: number | null;
};

type SlotRow = {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  hours: number;
  employee: { display_name: string | null } | null;
  template: { label: string | null } | null;
};

export default function ViewSchedulePage() {
  const params = useParams<{ week: string }>();
  const router = useRouter();
  const week = params.week;
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [totals, setTotals] = useState<Record<string, TotalsRow>>({});
  const [slotsByDay, setSlotsByDay] = useState<Record<string, SlotRow[]>>({});

  useEffect(() => {
    (async () => {
      // auth
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { router.replace('/auth'); return; }

      // find schedule id
      const { data: sched, error: sErr } = await supabase
        .from('schedules')
        .select('id')
        .eq('week_start', week)
        .maybeSingle();

      if (sErr || !sched) {
        setMsg('לא נמצא לוח לשבוע הזה. חזור וצור טיוטה.');
        setLoading(false);
        return;
      }
      const sid = sched.id as string;
      setScheduleId(sid);

      // load daily_totals
      const { data: totalsRows, error: tErr } = await supabase
        .from('daily_totals')
        .select('day,total_hours,forecast_sales,productivity')
        .eq('schedule_id', sid);

      if (tErr) { setMsg('שגיאה בטעינת סיכומים יומיים'); setLoading(false); return; }

      const tMap: Record<string, TotalsRow> = {};
      (totalsRows ?? []).forEach((r: any) => { tMap[r.day] = r as TotalsRow; });
      setTotals(tMap);

      // load slots joined
      const { data: slotRows, error: slErr } = await supabase
        .from('schedule_slots')
        .select(`
          id, day, start_time, end_time, hours,
          employee:employees!schedule_slots_employee_id_fkey(display_name),
          template:shift_templates!schedule_slots_template_id_fkey(label)
        `)
        .eq('schedule_id', sid);

      if (slErr) { setMsg('שגיאה בטעינת משבצות'); setLoading(false); return; }

      const mapByDay: Record<string, SlotRow[]> = {};
      (slotRows ?? []).forEach((s: any) => {
        if (!mapByDay[s.day]) mapByDay[s.day] = [];
        mapByDay[s.day].push(s as SlotRow);
      });
      // stable order: by start_time
      Object.keys(mapByDay).forEach(d => {
        mapByDay[d].sort((a,b) => a.start_time.localeCompare(b.start_time));
      });

      setSlotsByDay(mapByDay);
      setLoading(false);
    })();
  }, [router, week]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">סידור שבועי — {week}</h1>
          <div className="flex gap-2">
            <Link href="/manager/generate" className="rounded border px-3 py-2 hover:bg-gray-50">חזרה ליצירה</Link>
            <Link href="/manager" className="rounded border px-3 py-2 hover:bg-gray-50">לוח מנהלים</Link>
          </div>
        </div>

        {loading && <p>טוען…</p>}
        {!loading && msg && <p className="text-red-600">{msg}</p>}

        {!loading && !msg && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dayOrder.map(d => {
              const t = totals[d.key];
              const slots = slotsByDay[d.key] || [];
              return (
                <div key={d.key} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">{d.he}</h3>
                    <div className="text-xs text-gray-600">
                      יעד מכירות: {t?.forecast_sales ?? 0} ₪
                    </div>
                  </div>
                  <div className="text-sm mb-2">
                    שעות מוקצות: <b>{t?.total_hours ?? 0}</b>
                    {' · '}פריון: <b>{t?.productivity ?? '-'}</b>
                  </div>
                  <div className="space-y-2">
                    {slots.length === 0 && (
                      <div className="text-xs text-gray-500">אין משבצות ביום זה.</div>
                    )}
                    {slots.map(s => (
                      <div key={s.id} className="rounded bg-gray-50 p-2 text-sm">
                        <div className="font-medium">{s.employee?.display_name || '—'}</div>
                        <div className="text-xs text-gray-600">
                          {s.template?.label || '—'} · {s.start_time}–{s.end_time} · {s.hours}h
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
