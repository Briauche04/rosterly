'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ScheduleView() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('schedule_slots_view').select('*').eq('employee_uid', user.id).order('day');
    setRows(data || []);
  })(); }, []);

  return <main className="max-w-3xl mx-auto p-4">
    <h1 className="text-xl font-bold mb-4">המשמרות שלי</h1>
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="rounded border bg-white p-3 flex items-center justify-between">
          <div>{r.day_label}</div>
          <div>{r.start_time?.slice(0,5)}–{r.end_time?.slice(0,5)} ({r.hours}h)</div>
        </div>
      ))}
      {rows.length===0 && <p className="text-gray-600">אין משמרות מפורסמות לשבוע זה</p>}
    </div>
  </main>;
}
