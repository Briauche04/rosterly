'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// --- types & constants ---
type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
const DAY_LABELS: Record<DayKey, string> = {
  sun: 'ראשון',
  mon: 'שני',
  tue: 'שלישי',
  wed: 'רביעי',
  thu: 'חמישי',
  fri: 'שישי',
  sat: 'שבת',
};

type Employee = {
  id: string;
  display_name: string;
  contract_type: string | null;
  priority: number | null;
};

type ShiftTemplate = {
  id: number;
  label: string;
  day_type: 'weekday' | 'friday' | 'saturday';
  start_time: string; // 'HH:MM:SS'
  end_time: string;   // 'HH:MM:SS'
  hours: number;
};

type SlotRow = {
  id?: string;              // schedule_slots.id (optional local)
  employee_id: string | null;
  template_id: number | null;
  start_time?: string | null;
  end_time?: string | null;
  hours?: number | null;
};

type DayState = {
  day: DayKey;
  slots: SlotRow[];
};

function dayKeyToType(d: DayKey): ShiftTemplate['day_type'] {
  if (d === 'fri') return 'friday';
  if (d === 'sat') return 'saturday';
  return 'weekday';
}

export default function EditSchedulePage() {
  const { week } = useParams<{ week: string }>(); // expects 'YYYY-MM-DD' (week start)
  const router = useRouter();

  const [msg, setMsg] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [days, setDays] = useState<Record<DayKey, DayState>>({
    sun: { day: 'sun', slots: [] },
    mon: { day: 'mon', slots: [] },
    tue: { day: 'tue', slots: [] },
    wed: { day: 'wed', slots: [] },
    thu: { day: 'thu', slots: [] },
    fri: { day: 'fri', slots: [] },
    sat: { day: 'sat', slots: [] },
  });

  // --- guard: must be logged-in manager ---
  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        router.replace('/auth');
        return;
      }
      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('roles(code)')
        .eq('user_id', user.user.id);
      if (rErr) {
        setMsg('שגיאה בבדיקת הרשאות');
        return;
      }
      const ok = roles?.some((r: any) => r.roles?.code === 'manager');
      if (!ok) {
        setMsg('אין הרשאת מנהל');
        return;
      }
      // continue load
      await boot();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, week]);

  async function boot() {
    try {
      setLoading(true);
      setMsg('');

      // 1) ensure schedule exists for this week
      let { data: sched } = await supabase
        .from('schedules')
        .select('*')
        .eq('week_start', week)
        .maybeSingle();

      if (!sched) {
        const ins = await supabase
          .from('schedules')
          .insert({ week_start: week })
          .select('*')
          .single();
        if (ins.error) throw ins.error;
        sched = ins.data;
      }
      setScheduleId(sched.id);

      // 2) load employees & templates
      const [empRes, tplRes] = await Promise.all([
        supabase.from('employees').select('id, display_name, contract_type, priority').eq('active', true),
        supabase.from('shift_templates').select('*').order('day_type').order('label'),
      ]);
      if (empRes.error) throw empRes.error;
      if (tplRes.error) throw tplRes.error;
      setEmployees(empRes.data as any);
      setTemplates(tplRes.data as any);

      // 3) load existing slots
      const slotsRes = await supabase
        .from('schedule_slots')
        .select('id, day, employee_id, template_id, start_time, end_time, hours')
        .eq('schedule_id', sched.id)
        .order('day', { ascending: true });
      if (slotsRes.error) throw slotsRes.error;

      // 4) map into local state per day
      const next: Record<DayKey, DayState> = {
        sun: { day: 'sun', slots: [] },
        mon: { day: 'mon', slots: [] },
        tue: { day: 'tue', slots: [] },
        wed: { day: 'wed', slots: [] },
        thu: { day: 'thu', slots: [] },
        fri: { day: 'fri', slots: [] },
        sat: { day: 'sat', slots: [] },
      };
      (slotsRes.data as any[]).forEach((row) => {
        const d = row.day as DayKey;
        if (!next[d]) return;
        next[d].slots.push({
          id: row.id,
          employee_id: row.employee_id,
          template_id: row.template_id,
          start_time: row.start_time,
          end_time: row.end_time,
          hours: row.hours,
        });
      });
      setDays(next);
    } catch (e: any) {
      console.error(e);
      setMsg('שגיאה בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  }

  // --- helpers to mutate local day/slots ---
  function addSlot(d: DayKey) {
    setDays((prev) => {
      const copy = { ...prev };
      copy[d] = {
        ...copy[d],
        slots: [...copy[d].slots, { employee_id: null, template_id: null }],
      };
      return copy;
    });
  }

  function removeSlot(d: DayKey, idx: number) {
    setDays((prev) => {
      const copy = { ...prev };
      const arr = [...copy[d].slots];
      arr.splice(idx, 1);
      copy[d] = { ...copy[d], slots: arr };
      return copy;
    });
  }

  function setSlotEmployee(d: DayKey, idx: number, employee_id: string) {
    setDays((prev) => {
      const copy = { ...prev };
      const arr = [...copy[d].slots];
      arr[idx] = { ...arr[idx], employee_id };
      return copy;
    });
  }

  function setSlotTemplate(d: DayKey, idx: number, template_id: number) {
    const tpl = templates.find((t) => t.id === Number(template_id));
    setDays((prev) => {
      const copy = { ...prev };
      const arr = [...copy[d].slots];
      arr[idx] = {
        ...arr[idx],
        template_id: Number(template_id),
        start_time: tpl?.start_time ?? null,
        end_time: tpl?.end_time ?? null,
        hours: tpl?.hours ?? null,
      };
      return copy;
    });
  }

  // --- persist all days -> schedule_slots + totals ---
  async function saveAll() {
    if (!scheduleId) return;
    setSaving(true);
    setMsg('');
    try {
      // flatten all slots
      const payload: any[] = [];
      (Object.keys(days) as DayKey[]).forEach((dk) => {
        for (const s of days[dk].slots) {
          if (!s.employee_id || !s.template_id) continue; // skip incomplete rows
          payload.push({
            schedule_id: scheduleId,
            day: dk,
            employee_id: s.employee_id,
            template_id: s.template_id,
            start_time: s.start_time ?? null,
            end_time: s.end_time ?? null,
            hours: s.hours ?? 0,
          });
        }
      });

      // delete all existing slots for this schedule, then insert new snapshot
      const del = await supabase.from('schedule_slots').delete().eq('schedule_id', scheduleId);
      if (del.error) throw del.error;
      if (payload.length > 0) {
        const ins = await supabase.from('schedule_slots').insert(payload);
        if (ins.error) throw ins.error;
      }

      // compute & upsert daily totals + weekly totals (client-side)
      const perDay: Record<DayKey, number> = { sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0 };
      payload.forEach((p) => {
        perDay[p.day as DayKey] += Number(p.hours ?? 0);
      });

      // fetch forecast sales for this week (if any)
      const f = await supabase.from('weekly_forecasts').select('*').eq('week_start', week).maybeSingle();

      const salesMap: Record<DayKey, number> = {
        sun: Number(f.data?.sales_sun ?? 0),
        mon: Number(f.data?.sales_mon ?? 0),
        tue: Number(f.data?.sales_tue ?? 0),
        wed: Number(f.data?.sales_wed ?? 0),
        thu: Number(f.data?.sales_thu ?? 0),
        fri: Number(f.data?.sales_fri ?? 0),
        sat: Number(f.data?.sales_sat ?? 0),
      };

      // upsert daily_totals
      const dailyRows = (Object.keys(perDay) as DayKey[]).map((dk) => {
        const hours = perDay[dk];
        const sales = salesMap[dk] || 0;
        return {
          schedule_id: scheduleId,
          day: dk,
          total_hours: hours,
          forecast_sales: sales,
          productivity: hours > 0 ? sales / hours : null,
        };
      });

      // delete + insert (simplify)
      const delDaily = await supabase.from('daily_totals').delete().eq('schedule_id', scheduleId);
      if (delDaily.error) throw delDaily.error;
      if (dailyRows.length) {
        const insDaily = await supabase.from('daily_totals').insert(dailyRows);
        if (insDaily.error) throw insDaily.error;
      }

      // upsert weekly_totals
      const totalHours = Object.values(perDay).reduce((a, b) => a + b, 0);
      const totalSales = Object.values(salesMap).reduce((a, b) => a + b, 0);
      const weekly = {
        schedule_id: scheduleId,
        total_hours: totalHours,
        total_sales: totalSales,
        productivity: totalHours > 0 ? totalSales / totalHours : null,
      };
      const delWeekly = await supabase.from('weekly_totals').delete().eq('schedule_id', scheduleId);
      if (delWeekly.error) throw delWeekly.error;
      const insWeekly = await supabase.from('weekly_totals').insert(weekly);
      if (insWeekly.error) throw insWeekly.error;

      setMsg('✅ נשמר בהצלחה');
    } catch (e: any) {
      console.error(e);
      setMsg('❌ שמירה נכשלה');
    } finally {
      setSaving(false);
    }
  }

  const weekLabel = useMemo(() => {
    try {
      const d = new Date(`${week}T00:00:00`);
      const fmt = d.toLocaleDateString('he-IL');
      return fmt;
    } catch {
      return week;
    }
  }, [week]);

  if (msg && !loading && msg.includes('אין הרשאת מנהל')) {
    return <p className="p-6 text-red-600 text-center">{msg}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">עריכת סידור — {weekLabel}</h1>
          <div className="flex gap-2">
            <button
              onClick={saveAll}
              disabled={saving || loading || !scheduleId}
              className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'שומר…' : 'שמור הכל'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded bg-white p-6 shadow">טוען…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(days) as DayKey[]).map((dk) => {
              const d = days[dk];
              const tType = dayKeyToType(dk);
              const tplOptions = templates.filter((t) => t.day_type === tType);
              return (
                <section key={dk} className="rounded-lg bg-white p-4 shadow">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold">{DAY_LABELS[dk]}</h2>
                    <button
                      onClick={() => addSlot(dk)}
                      className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      הוסף משבצת
                    </button>
                  </div>

                  {d.slots.length === 0 && (
                    <p className="text-sm text-gray-500">אין משבצות. הוסף משבצת.</p>
                  )}

                  <div className="flex flex-col gap-3">
                    {d.slots.map((s, idx) => (
                      <div key={idx} className="rounded border p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium">עובד</label>
                            <select
                              className="mt-1 w-full rounded border px-2 py-2"
                              value={s.employee_id ?? ''}
                              onChange={(e) => setSlotEmployee(dk, idx, e.target.value)}
                            >
                              <option value="">— בחר עובד —</option>
                              {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.display_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium">משמרת</label>
                            <select
                              className="mt-1 w-full rounded border px-2 py-2"
                              value={s.template_id ?? ''}
                              onChange={(e) => setSlotTemplate(dk, idx, Number(e.target.value))}
                            >
                              <option value="">— בחר משמרת —</option>
                              {tplOptions.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.label} ({t.start_time.slice(0,5)}–{t.end_time.slice(0,5)} • {t.hours}ש׳)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>כניסה: <strong>{s.start_time?.slice(0,5) ?? '-'}</strong></div>
                          <div>יציאה: <strong>{s.end_time?.slice(0,5) ?? '-'}</strong></div>
                          <div>שעות: <strong>{s.hours ?? 0}</strong></div>
                        </div>

                        <div className="mt-3 text-right">
                          <button
                            onClick={() => removeSlot(dk, idx)}
                            className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-800 hover:bg-gray-300"
                          >
                            הסר
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {msg && (
          <div className="mt-4 rounded border bg-white p-3 text-center text-sm">
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}
