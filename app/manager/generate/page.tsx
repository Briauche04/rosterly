'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { dayOrder, weekStartSunday } from '@/lib/week';

type ForecastRow = {
  id: number;
  week_start: string;
  target_productivity: number;
  sales_sun: number;
  sales_mon: number;
  sales_tue: number;
  sales_wed: number;
  sales_thu: number;
  sales_fri: number;
  sales_sat: number;
};

const dayKeyToForecastCol: Record<string, keyof ForecastRow> = {
  sun: 'sales_sun',
  mon: 'sales_mon',
  tue: 'sales_tue',
  wed: 'sales_wed',
  thu: 'sales_thu',
  fri: 'sales_fri',
  sat: 'sales_sat',
};

export default function GenerateSchedulePage() {
  const router = useRouter();
  const [weekStart, setWeekStart] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false);

  const defaultWeek = useMemo(() => weekStartSunday(), []);
  useEffect(() => {
    setWeekStart(defaultWeek);
  }, [defaultWeek]);

  useEffect(() => {
    (async () => {
      // auth
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { router.replace('/auth'); return; }

      // role check
      const { data: roles } = await supabase
        .from('user_roles')
        .select('roles(code)')
        .eq('user_id', u.user.id);

      const ok = roles?.some(r => r.roles?.code === 'manager') ?? false;
      setIsManager(ok);
    })();
  }, [router]);

  async function ensureSchedule() {
    setMsg('');
    setLoading(true);
    try {
      // 1) read forecast for this week
      const { data: fcErrCheck } = await supabase
        .from('weekly_forecasts')
        .select('*')
        .eq('week_start', weekStart)
        .maybeSingle();

      if (!fcErrCheck) {
        setMsg('❌ לא נמצאה תחזית שבועית לשבוע הזה. צור תחזית ב־weekly_forecasts.');
        setLoading(false);
        return;
      }

      const forecast = fcErrCheck as ForecastRow;

      // 2) upsert schedules row (unique by week_start)
      const { data: sched, error: schedErr } = await supabase
        .from('schedules')
        .upsert({ week_start: weekStart }, { onConflict: 'week_start' })
        .select('id')
        .single();
      if (schedErr || !sched?.id) throw new Error(schedErr?.message || 'schedule upsert failed');

      const scheduleId = sched.id as string;

      // 3) build daily target totals = sales / target_productivity
      const target = Number(forecast.target_productivity || 0);
      const dailyRows = dayOrder.map(d => {
        const sales = Number(forecast[dayKeyToForecastCol[d.key]] || 0);
        const hoursTarget = target > 0 ? sales / target : 0;
        return {
          schedule_id: scheduleId,
          day: d.key,
          total_hours: 0,           // will be filled by auto-assign (Step 3)
          forecast_sales: sales,
          productivity: null,       // computed after assignment
          // we keep hoursTarget only implicitly; total_hours remains 0 for now
        };
      });

      // 4) clear previous daily_totals for this schedule, then insert fresh “target-only” rows
      await supabase.from('daily_totals').delete().eq('schedule_id', scheduleId);
      const { error: insTotalsErr } = await supabase.from('daily_totals').insert(dailyRows);
      if (insTotalsErr) throw new Error(insTotalsErr.message);

      setMsg('✅ נוצר לוח שבועי (טיוטה) והוזנו יעדים יומיים. אפשר לעבור לצפייה.');
    } catch (e: any) {
      setMsg('❌ שגיאה: ' + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  }

  if (!isManager) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold mb-2">יצירת לוח שבועי</h1>
          <p className="text-red-600">אין הרשאת מנהל</p>
          <div className="mt-4">
            <Link href="/dashboard" className="rounded bg-gray-200 px-3 py-2 text-gray-800 hover:bg-gray-300">חזרה</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow space-y-4">
        <h1 className="text-2xl font-bold">יצירת לוח שבועי (טיוטה)</h1>

        <label className="block text-sm font-medium">תאריך תחילת שבוע (ראשון):</label>
        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />

        <div className="flex gap-2">
          <button
            onClick={ensureSchedule}
            disabled={loading || !weekStart}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'מכין…' : 'צור/רענן טיוטה'}
          </button>

          <Link
            href={`/manager/schedule/${weekStart}`}
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            לצפייה בלוח
          </Link>
        </div>

        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </main>
  );
}
