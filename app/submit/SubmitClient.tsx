// app/submit/SubmitClient.tsx  (CLIENT — must NOT import/use useSearchParams)
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const HOME_ROUTE = '/rosterly';

type WeekdayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu';
type WeekendKey = 'fri' | 'sat';
type DayKey = WeekdayKey | WeekendKey;

type WeekdayChoice = 'פתוח' | 'בוקר' | 'ערב' | 'לא זמין';
type WeekendChoice = 'פתוח' | 'שישי' | 'מוצ״ש' | 'לא זמין';

const WEEKDAYS: { key: WeekdayKey; label: string }[] = [
  { key: 'sun', label: 'ראשון' },
  { key: 'mon', label: 'שני' },
  { key: 'tue', label: 'שלישי' },
  { key: 'wed', label: 'רביעי' },
  { key: 'thu', label: 'חמישי' },
];

const CHOICES_WEEKDAY: WeekdayChoice[] = ['פתוח', 'בוקר', 'ערב', 'לא זמין'];
const CHOICES_WEEKEND: WeekendChoice[] = ['פתוח', 'שישי', 'מוצ״ש', 'לא זמין'];

function getCurrentWeekStartSunday(): string {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const diff = today.getDate() - day;
  const sunday = new Date(today);
  sunday.setDate(diff);
  sunday.setHours(0, 0, 0, 0);
  return sunday.toISOString().slice(0, 10);
}

export default function SubmitClient({ lang }: { lang: string }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [globalNote, setGlobalNote] = useState('');

  const [weekdayChoices, setWeekdayChoices] = useState<Record<WeekdayKey, WeekdayChoice>>({
    sun: 'פתוח', mon: 'פתוח', tue: 'פתוח', wed: 'פתוח', thu: 'פתוח',
  });
  const [weekendChoice, setWeekendChoice] = useState<WeekendChoice>('לא זמין');

  const weekStart = useMemo(() => getCurrentWeekStartSunday(), []);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          router.replace('/auth');
          return;
        }
        setEmail(data.user.email ?? null);

        const { data: emp, error: empErr } = await supabase
          .from('employees')
          .select('id')
          .eq('user_uid', data.user.id)
          .single();

        if (empErr || !emp?.id) {
          setStatus('❌ לא נמצא עובד מקושר למשתמש. פנה/י למנהל שיחבר אותך במערכת.');
          setLoading(false);
          return;
        }
        setEmployeeId(emp.id as string);

        const { data: submission, error: subErr } = await supabase
          .from('submissions')
          .select('id')
          .eq('employee_id', emp.id)
          .eq('week_start', weekStart)
          .single();

        if (!subErr && submission?.id) {
          const { data: days, error: daysErr } = await supabase
            .from('submission_days')
            .select('day, available, note')
            .eq('submission_id', submission.id);

          if (!daysErr && days && days.length > 0) {
            const nextWeekdays: Record<WeekdayKey, WeekdayChoice> = {
              sun: 'לא זמין', mon: 'לא זמין', tue: 'לא זמין', wed: 'לא זמין', thu: 'לא זמין',
            };
            let friAvailable = false;
            let satAvailable = false;

            days.forEach((d: any) => {
              const key = d.day as DayKey;
              const available = !!d.available;
              if (key === 'sun' || key === 'mon' || key === 'tue' || key === 'wed' || key === 'thu') {
                nextWeekdays[key] = available ? 'פתוח' : 'לא זמין';
              } else if (key === 'fri') friAvailable = available;
              else if (key === 'sat') satAvailable = available;
            });

            setWeekdayChoices(nextWeekdays);
            setWeekendChoice(
              friAvailable && satAvailable ? 'פתוח'
              : friAvailable ? 'שישי'
              : satAvailable ? 'מוצ״ש'
              : 'לא זמין'
            );

            const firstNote = days.find((d: any) => d.note)?.note;
            if (firstNote) setGlobalNote(firstNote);
            setStatus('✅ נטען טופס קיים – אפשר לערוך ולשמור מחדש.');
          }
        }
      } catch {
        setStatus('❌ שגיאה בטעינת העמוד.');
      } finally {
        setLoading(false);
      }
    })();
  }, [router, weekStart]);

  function setWeekdayChoice(day: WeekdayKey, value: WeekdayChoice) {
    setWeekdayChoices((prev) => ({ ...prev, [day]: value }));
  }

  async function handleSubmit() {
    if (!employeeId) { setStatus('❌ לא נמצא עובד במערכת.'); return; }
    setSaving(true);
    setStatus('שומר...');

    try {
      const { data: submission, error: subErr } = await supabase
        .from('submissions')
        .upsert({ week_start: weekStart, employee_id: employeeId }, { onConflict: 'week_start,employee_id' })
        .select('id')
        .single();

      if (subErr || !submission?.id) {
        setStatus('❌ כשל בשמירת הבקשה: ' + (subErr?.message ?? ''));
        setSaving(false);
        return;
      }
      const submissionId = submission.id as string;

      await supabase.from('submission_days').delete().eq('submission_id', submissionId);

      const weekdayRows = WEEKDAYS.map((d) => {
        const choice = weekdayChoices[d.key];
        const available = choice !== 'לא זמין';
        return { submission_id: submissionId, day: d.key, available, start_time: null, end_time: null, note: globalNote || null };
      });

      const weekendRows = [
        { submission_id: submissionId, day: 'fri' as WeekendKey, available: weekendChoice === 'פתוח' || weekendChoice === 'שישי', start_time: null, end_time: null, note: globalNote || null },
        { submission_id: submissionId, day: 'sat' as WeekendKey, available: weekendChoice === 'פתוח' || weekendChoice === 'מוצ״ש', start_time: null, end_time: null, note: globalNote || null },
      ];

      const { error: insErr } = await supabase.from('submission_days').insert([...weekdayRows, ...weekendRows]);
      setStatus(insErr ? '❌ כשל בשמירת הימים: ' + insErr.message : '✅ המשמרות נשמרו בהצלחה!');
    } catch {
      setStatus('❌ שגיאת מערכת בעת שמירה.');
    } finally {
      setSaving(false);
    }
  }

  const handleLoginClick = () => router.push(`/rosterly/login?lang=${lang}`);
  const goHome = () => router.push(HOME_ROUTE);

  if (loading) {
    return (
      <main dir="rtl" className="page">
        <div className="page-inner">
          <div className="center-card">טוען את טופס המשמרות...</div>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="page">
      <div className="page-inner">
        <nav className="top-nav">
          <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={goHome}>Rosterly</div>
          <div className="nav-links">
            <button className="login-btn" type="button" onClick={handleLoginClick}>
              {email ? 'מחובר/ת' : 'להתחבר'}
            </button>
            <a href="/rosterly/team?lang=he">צוות</a>
            <a href="/rosterly/forum?lang=he">פורום</a>
            <a href="/rosterly/tutorials?lang=he">מדריכים</a>
          </div>
        </nav>

        {/* ...rest of your JSX (unchanged styles) ... */}
        {/* keep your existing content & styles here (omitted for brevity) */}
      </div>
    </main>
  );
}
