import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
/* Generator v2 ... (see full rules in previous message) */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const week_start: string = body.week_start;
  const mode: 'fixed_hours' | 'productivity' | undefined = body.mode;
  const desired_hours: number | undefined = body.desired_hours;
  const sales: number | undefined = body.sales;
  const pct: number = typeof body.pct === 'number' ? body.pct : 0.005;
  if (!week_start) return NextResponse.json({ error: 'week_start required' }, { status: 400 });

  const { data: schedList, error: schedErr } = await supabase.from('schedules').select('*').eq('week_start', week_start).limit(1);
  if (schedErr) return NextResponse.json({ error: schedErr.message }, { status: 500 });
  let schedule_id: string | null = schedList && schedList[0]?.id;
  if (!schedule_id) {
    const { data: ins, error: insErr } = await supabase.from('schedules').insert({ week_start, status: 'draft' }).select('*').limit(1);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    schedule_id = ins![0].id as string;
  }

  const { data: employees, error: empErr } = await supabase.from('employees').select('*').eq('active', true);
  if (empErr) return NextResponse.json({ error: empErr.message }, { status: 500 });
  const { data: avail, error: avErr } = await supabase.from('submission_days_view').select('*').eq('week_start', week_start);
  if (avErr) return NextResponse.json({ error: avErr.message }, { status: 500 });

  const { error: delErr } = await supabase.from('schedule_slots').delete().eq('schedule_id', schedule_id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  type Day = 'sun'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat';
  const days: Day[] = ['sun','mon','tue','wed','thu','fri','sat'];

  const availMap: Record<string, Record<Day, boolean>> = {};
  for (const a of (avail || [])) {
    const emp = a.employee_id as string;
    if (!availMap[emp]) availMap[emp] = { sun:false, mon:false, tue:false, wed:false, thu:false, fri:false, sat:false } as any;
    (availMap[emp] as any)[a.day] = !!a.available;
  }

  const tplMorning = { start: '08:00', end: '16:00', hours: 8 };
  const tplMiddle  = { start: '10:00', end: '18:00', hours: 8 };
  const tplEvening = { start: '15:00', end: '22:30', hours: 7.5 };
  const tplGlobal  = { start: '14:00', end: '23:00', hours: 9 };

  let targets = { morning: 4, middle: 2, evening: 7 };
  const baseDailyHours = targets.morning*tplMorning.hours + targets.middle*tplMiddle.hours + targets.evening*tplEvening.hours;
  const baseWeeklyHours = baseDailyHours * 7;
  let desiredWeeklyHours: number | undefined;
  if (mode === 'fixed_hours' && typeof desired_hours === 'number') desiredWeeklyHours = desired_hours;
  if (mode === 'productivity' && typeof sales === 'number') desiredWeeklyHours = sales * pct;
  if (desiredWeeklyHours && desiredWeeklyHours > 0) {
    const factor = desiredWeeklyHours / baseWeeklyHours;
    const scale = (n: number) => Math.max(0, Math.round(n * factor));
    targets = { morning: scale(targets.morning), middle: scale(targets.middle), evening: scale(targets.evening) };
    if (targets.morning + targets.middle + targets.evening === 0) targets = { morning: 1, middle: 1, evening: 1 };
  }

  const roleOf = (e: any) => (typeof e.role === 'string' ? e.role.toLowerCase() : '');
  const isKeyHolder = (e: any) => roleOf(e).includes('key') && roleOf(e).includes('holder');
  const isAvailable = (empId: string, day: Day) => (empId in availMap ? availMap[empId][day] : true);

  const assignedCount: Record<string, number> = {};
  const hadEveningYesterday: Record<string, boolean> = {};
  const globals = (employees || []).filter((e: any) => !!e.global_worker);
  const staff   = (employees || []).filter((e: any) => !e.global_worker);
  let gPtr = 0;

  function pickFrom(list: any[], n: number, day: Day, opts: { morning?: boolean; evening?: boolean; requireKeyHolder?: boolean } = {}) {
    const pool = list.filter(e => isAvailable(e.id, day)).filter(e => !(opts.morning && hadEveningYesterday[e.id]));
    pool.sort((a, b) => (assignedCount[a.id]||0) - (assignedCount[b.id]||0));
    const chosen: any[] = [];
    if (opts.requireKeyHolder) {
      const key = pool.find(isKeyHolder);
      if (key) chosen.push(key);
    }
    for (const e of pool) {
      if (chosen.length >= n) break;
      if (opts.requireKeyHolder && chosen.some(c => c.id === e.id)) continue;
      chosen.push(e);
    }
    return chosen.slice(0, n);
  }

  const inserts: any[] = [];
  for (let di = 0; di < days.length; di++) {
    const day = days[di] as Day;
    if (di === 0) {
      for (const e of (employees||[])) hadEveningYesterday[e.id] = false;
    } else {
      const prevDay = days[di-1];
      const prevEves = inserts.filter(r => r.day === prevDay && (r.hours as number) >= 7.4);
      const flagged = new Set(prevEves.map(r => r.employee_id as string));
      for (const e of (employees||[])) hadEveningYesterday[e.id] = flagged.has(e.id);
    }

    const eveningsNeeded = Math.max(0, targets.evening);
    let evChosen: any[] = [];
    if (globals.length > 0 && eveningsNeeded > 0) {
      const take = Math.min(eveningsNeeded, globals.length);
      for (let i = 0; i < take; i++) {
        const g = globals[(gPtr + i) % globals.length];
        inserts.push({ schedule_id, day, employee_id: g.id, start_time: tplGlobal.start, end_time: tplGlobal.end, hours: tplGlobal.hours });
        assignedCount[g.id] = (assignedCount[g.id]||0) + 1;
        evChosen.push(g);
      }
      gPtr = (gPtr + max(1, Math.min(eveningsNeeded, globals.length))) % globals.length
    }

    const evRemain = Math.max(0, eveningsNeeded - evChosen.length);
    if (evRemain > 0) {
      const needKey = !evChosen.some(isKeyHolder);
      const picked = pickFrom(staff, evRemain, day, { evening: true, requireKeyHolder: needKey });
      for (const e of picked) {
        const start = isKeyHolder(e) ? '15:00' : tplEvening.start;
        inserts.push({ schedule_id, day, employee_id: e.id, start_time: start, end_time: tplEvening.end, hours: tplEvening.hours });
        assignedCount[e.id] = (assignedCount[e.id]||0) + 1;
      }
    }

    if (targets.morning > 0) {
      const picked = pickFrom(staff, targets.morning, day, { morning: true });
      for (const e of picked) {
        inserts.push({ schedule_id, day, employee_id: e.id, start_time: tplMorning.start, end_time: tplMorning.end, hours: tplMorning.hours });
        assignedCount[e.id] = (assignedCount[e.id]||0) + 1;
      }
    }

    if (targets.middle > 0) {
      const picked = pickFrom(staff, targets.middle, day, {});
      for (const e of picked) {
        inserts.push({ schedule_id, day, employee_id: e.id, start_time: tplMiddle.start, end_time: tplMiddle.end, hours: tplMiddle.hours });
        assignedCount[e.id] = (assignedCount[e.id]||0) + 1;
      }
    }
  }

  if (inserts.length > 0) {
    const { error: insErr } = await supabase.from('schedule_slots').insert(inserts);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, schedule_id, inserted: inserts.length, targets });
}
