'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { dayOrder } from '@/lib/week';
import Link from 'next/link';

type Row = {
  id: string;
  week_start: string;
  notes: string | null;
  days: Array<{ day: string; selection: string }>;
};

export default function MySubs() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data: emp, error: empErr } = await supabase
        .from('employees')
        .select('id')
        .single();
      if (empErr || !emp) { setMsg('לא נמצא עובד'); return; }

      const { data: subs, error } = await supabase
        .from('submissions')
        .select('id, week_start, notes')
        .eq('employee_id', emp.id)
        .order('week_start', { ascending:false });

      if (error || !subs?.length) { setMsg('אין הגשות'); return; }

      const withDays: Row[] = [];
      for (const s of subs) {
        const { data: days } = await supabase
          .from('submission_days')
          .select('day, selection')
          .eq('submission_id', s.id);
        withDays.push({ ...s, days: (days ?? []) as any });
      }
      setRows(withDays);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">ההגשות שלי</h1>
          <Link href="/submit" className="px-3 py-2 rounded bg-blue-600 text-white">הגש שבוע חדש</Link>
        </div>
        {msg && <p className="text-sm">{msg}</p>}
        {!msg && rows.map(r => (
          <div key={r.id} className="border rounded-lg p-3 mb-3">
            <div className="font-semibold mb-2">שבוע: {r.week_start}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {dayOrder.map(d => {
                const found = r.days.find(x => x.day === d.key);
                return (
                  <div key={d.key} className="border rounded px-2 py-1">
                    <div className="font-medium">{d.he}</div>
                    <div>{found?.selection ?? '-'}</div>
                  </div>
                );
              })}
            </div>
            {r.notes && <div className="mt-2 text-sm text-gray-700">הערות: {r.notes}</div>}
          </div>
        ))}
      </div>
    </main>
  );
}
