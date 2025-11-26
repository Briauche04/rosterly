// app/manager/submissions/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Status = 'pending' | 'approved' | 'rejected';

type SubmissionDay = {
  day: string;
  available: boolean | null;
};

type SubmissionRow = {
  id: string;
  employee_id: string;
  week_start: string;
  status: Status | null;
  created_at: string;
  employees?: {
    full_name: string | null;
    role: string | null;
  } | null;
  submission_days?: SubmissionDay[] | null;
};

function getCurrentWeekStartSunday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day;
  const sunday = new Date(today);
  sunday.setDate(diff);
  sunday.setHours(0, 0, 0, 0);
  return sunday.toISOString().slice(0, 10);
}

export default function ManagerSubmissionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'manager' | 'op' | 'staff'>('all');
  const [savingId, setSavingId] = useState<string | null>(null);

  const weekStart = useMemo(() => getCurrentWeekStartSunday(), []);

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          router.replace('/auth');
          return;
        }

        const { data: userRoles, error: rolesErr } = await supabase
          .from('user_roles')
          .select('role_code')
          .eq('user_uid', data.user.id);

        if (rolesErr) {
          setAuthError('שגיאה בבדיקת הרשאות.');
          return;
        }

        const allowed = (userRoles ?? []).some((r) =>
          ['manager', 'op', 'admin'].includes(r.role_code)
        );
        if (!allowed) {
          setAuthError('אין לך הרשאה לצפות בדף זה.');
          return;
        }

        const { data: subs, error: subsErr } = await supabase
          .from('submissions')
          .select(
            `
            id,
            employee_id,
            week_start,
            status,
            created_at,
            employees:employee_id (
              full_name,
              role
            ),
            submission_days (
              day,
              available
            )
          `
          )
          .eq('week_start', weekStart)
          .order('created_at', { ascending: true });

        if (subsErr) {
          setStatusMsg('שגיאה בטעינת ההגשות.');
          return;
        }

        setSubmissions(subs as SubmissionRow[]);
      } catch {
        setStatusMsg('שגיאת מערכת.');
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [router, weekStart]);

  const mappedStatus = (row: SubmissionRow): Status => {
    if (!row.status) return 'pending';
    if (row.status === 'approved' || row.status === 'rejected') return row.status;
    if (row.status === 'pending') return 'pending';
    return 'pending';
  };

  async function updateStatus(row: SubmissionRow, newStatus: Status) {
    setSavingId(row.id);
    setStatusMsg('');

    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', row.id);

      if (error) {
        setStatusMsg('שגיאה בעדכון הסטטוס.');
        return;
      }

      setSubmissions((prev) =>
        prev.map((s) => (s.id === row.id ? { ...s, status: newStatus } : s))
      );

      if (newStatus === 'approved') setStatusMsg('ההגשה סומנה כתקינה.');
      else if (newStatus === 'rejected') setStatusMsg('ההגשה נדחתה – העובד/ת יקבל/תקבל התראה להגשה מחדש.');
    } catch {
      setStatusMsg('שגיאת מערכת בעדכון סטטוס.');
    } finally {
      setSavingId(null);
    }
  }

  function handlePrint() {
    router.push(`/manager/schedule/${weekStart}/print`);
  }

  function roleBucket(role: string | null | undefined): 'manager' | 'op' | 'staff' {
    if (!role) return 'staff';
    const lowered = role.toLowerCase();
    if (lowered.includes('manager') || lowered.includes('מנהל')) return 'manager';
    if (lowered.includes('op') || lowered.includes('operations')) return 'op';
    return 'staff';
  }

  const filteredSubmissions = submissions.filter((s) => {
    if (filterRole === 'all') return true;
    return roleBucket(s.employees?.role ?? null) === filterRole;
  });

  function buildDayChips(row: SubmissionRow) {
    const map = new Map<string, boolean>();
    (row.submission_days ?? []).forEach((d) => {
      if (!d.day) return;
      map.set(d.day, !!d.available);
    });

    const weekdayOrder: { key: string; label: string }[] = [
      { key: 'sun', label: 'א׳' },
      { key: 'mon', label: 'ב׳' },
      { key: 'tue', label: 'ג׳' },
      { key: 'wed', label: 'ד׳' },
      { key: 'thu', label: 'ה׳' },
    ];

    const weekdayChips = weekdayOrder.map((d) => {
      const av = map.get(d.key) ?? false;
      return {
        key: d.key,
        label: d.label,
        value: av ? 'פתוח' : 'לא זמין',
        available: av,
      };
    });

    const fri = map.get('fri') ?? false;
    const sat = map.get('sat') ?? false;

    let weekendValue: 'פתוח' | 'שישי' | 'מוצ״ש' | 'לא זמין' = 'לא זמין';
    if (fri && sat) weekendValue = 'פתוח';
    else if (fri && !sat) weekendValue = 'שישי';
    else if (!fri && sat) weekendValue = 'מוצ״ש';

    const weekendChip = {
      key: 'weekend',
      label: 'סופ״ש',
      value: weekendValue,
      available: weekendValue !== 'לא זמין',
    };

    return [...weekdayChips, weekendChip];
  }

  if (loading) {
    return (
      <main dir="rtl" className="page">
        <div className="page-inner">
          <div className="center-card">טוען הגשות...</div>
        </div>
        <style jsx>{`
          .page { min-height: 100vh; background: #f5f3ef; }
          .page-inner { width: 100%; max-width: 1200px; margin: 0 auto; padding: 16px 32px 40px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .center-card { margin: 140px auto 0; max-width: 460px; padding: 20px 24px; border-radius: 18px; background: #f0e7d8; text-align: center; font-size: 14px; color: #4f553d; }
        `}</style>
      </main>
    );
  }

  if (authError) {
    return (
      <main dir="rtl" className="page">
        <div className="page-inner">
          <p style={{ marginTop: '120px', textAlign: 'center', color: '#4f553d' }}>
            {authError}
          </p>
        </div>
        <style jsx>{`
          .page { min-height: 100vh; background: #f5f3ef; }
          .page-inner { width: 100%; max-width: 1200px; margin: 0 auto; padding: 16px 32px 40px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        `}</style>
      </main>
    );
  }

  return (
    <main dir="rtl" className="page">
      {/* NOTE: Header/nav comes from RosterlyShell via /manager/layout.tsx */}

      <div className="page-inner">
        <div className="content">
          <section className="hero">
            <div className="logo-card small">
              <span className="logo-text">Rosterly</span>
            </div>
            <h1 className="hero-title">הגשות משמרות – מנהלים</h1>
            <p className="hero-subtitle">
              סקירה ואישור של כל ההגשות לשבוע שמתחיל ב־ {weekStart}.
            </p>
          </section>

          <section className="card card-toolbar">
            <div className="toolbar-left">
              <div className="pill small">שבוע שמתחיל ב־ {weekStart}</div>
            </div>
            <div className="toolbar-right">
              <div className="filter-role">
                <span className="filter-label">סינון לפי תפקיד:</span>
                <button
                  type="button"
                  className={'filter-pill' + (filterRole === 'all' ? ' filter-pill--active' : '')}
                  onClick={() => setFilterRole('all')}
                >
                  כולם
                </button>
                <button
                  type="button"
                  className={'filter-pill' + (filterRole === 'staff' ? ' filter-pill--active' : '')}
                  onClick={() => setFilterRole('staff')}
                >
                  צוות
                </button>
                <button
                  type="button"
                  className={'filter-pill' + (filterRole === 'op' ? ' filter-pill--active' : '')}
                  onClick={() => setFilterRole('op')}
                >
                  OP
                </button>
                <button
                  type="button"
                  className={'filter-pill' + (filterRole === 'manager' ? ' filter-pill--active' : '')}
                  onClick={() => setFilterRole('manager')}
                >
                  מנהלים
                </button>
              </div>

              <button type="button" className="print-button" onClick={handlePrint}>
                🖨️ הדפסת סידור שבועי
              </button>
            </div>
          </section>

          <section className="card card-table">
            {filteredSubmissions.length === 0 ? (
              <p className="empty-text">אין הגשות לשבוע זה.</p>
            ) : (
              <div className="table">
                <div className="table-head">
                  <span className="col col-name">שם עובד/ת</span>
                  <span className="col col-role">תפקיד</span>
                  <span className="col col-days">זמינות</span>
                  <span className="col col-status">סטטוס</span>
                  <span className="col col-actions">פעולות</span>
                </div>

                {filteredSubmissions.map((row) => {
                  const st = mappedStatus(row);
                  const isPending = st === 'pending';
                  const isApproved = st === 'approved';
                  const isRejected = st === 'rejected';
                  const chips = buildDayChips(row);

                  return (
                    <div
                      key={row.id}
                      className={
                        'table-row' +
                        (isApproved
                          ? ' table-row--ok'
                          : isRejected
                          ? ' table-row--bad'
                          : ' table-row--pending')
                      }
                    >
                      <span className="col col-name">
                        {row.employees?.full_name ?? '—'}
                      </span>
                      <span className="col col-role">
                        {row.employees?.role ?? 'צוות'}
                      </span>
                      <span className="col col-days">
                        <div className="day-chips">
                          {chips.map((chip) => (
                            <div
                              key={chip.key}
                              className={
                                'day-chip' + (chip.available ? ' day-chip--yes' : ' day-chip--no')
                              }
                            >
                              <span className="day-chip-label">{chip.label}</span>
                              <span className="day-chip-value">{chip.value}</span>
                            </div>
                          ))}
                        </div>
                      </span>
                      <span className="col col-status">
                        {isApproved && <span className="status-pill status-pill--ok">תקין</span>}
                        {isRejected && (
                          <span className="status-pill status-pill--bad">נדחה – ממתין להגשה מחדש</span>
                        )}
                        {isPending && (
                          <span className="status-pill status-pill--pending">ממתין לסיווג</span>
                        )}
                      </span>
                      <span className="col col-actions">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              className="action-button action-button--ok"
                              onClick={() => updateStatus(row, 'approved')}
                              disabled={savingId === row.id}
                            >
                              תקין
                            </button>
                            <button
                              type="button"
                              className="action-button action-button--bad"
                              onClick={() => updateStatus(row, 'rejected')}
                              disabled={savingId === row.id}
                            >
                              נדחה
                            </button>
                          </>
                        )}
                        {isApproved && (
                          <button
                            type="button"
                            className="action-link"
                            onClick={() => updateStatus(row, 'pending')}
                            disabled={savingId === row.id}
                          >
                            החזרה למצב בדיקה
                          </button>
                        )}
                        {isRejected && <span className="action-note">ממתין להגשה חדשה מהעובד/ת</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {statusMsg && <p className="status-msg">{statusMsg}</p>}
          </section>
        </div>
      </div>

      <style jsx>{`
        .page { min-height: 100vh; background: #f5f3ef; }
        .page-inner { width: 100%; max-width: 1440px; margin: 0 auto; padding: 12px 32px 32px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
        .content { max-width: 900px; margin: 40px auto 0; text-align: center; }
        .hero { margin-bottom: 24px; }
        .logo-card.small { width: 80px; height: 80px; margin: 0 auto 16px; border-radius: 24px; background: #f0e7d8; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,.03); }
        .logo-text { font-size: 13px; color: #4f553d; font-weight: 500; }
        .hero-title { font-size: 20px; margin-bottom: 4px; color: #3a3e2d; font-weight: 600; }
        .hero-subtitle { font-size: 13px; color: #777; margin: 0; }
        .card { background: #efe6d8; border-radius: 18px; padding: 14px 18px; text-align: right; box-shadow: 0 14px 35px rgba(0,0,0,0.03); }
        .card-toolbar { margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 10px; font-size: 11px; background: #e0d6c3; color: #4f553d; }
        .pill.small { font-size: 10px; padding-inline: 8px; }
        .filter-role { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b6458; }
        .filter-label { margin-left: 4px; }
        .filter-pill { border-radius: 999px; border: 1px solid #d3ccbf; background: #f7f2e9; padding: 3px 8px; font-size: 11px; color: #746b5e; cursor: pointer; }
        .filter-pill--active { background: #4f553d; color: #f5f3ef; border-color: #4f553d; }
        .print-button { border-radius: 999px; border: none; background: #4f553d; color: #f5f3ef; padding: 6px 14px; font-size: 12px; cursor: pointer; }
        .card-table { margin-top: 14px; }
        .table { width: 100%; font-size: 12px; }
        .table-head, .table-row { display: grid; grid-template-columns: 1.6fr 1fr 2.4fr 1.2fr 1.6fr; align-items: center; gap: 8px; padding: 6px 8px; }
        .table-head { border-bottom: 1px solid #e0d5c3; color: #6b6458; font-weight: 500; }
        .table-row { border-radius: 10px; margin-top: 6px; background: #f4eee2; border: 1px solid #e3dacb; }
        .table-row--ok { background: #f1f6ea; border-color: #d3e2bf; }
        .table-row--pending { background: #fdf3e3; border-color: #f0e0c7; }
        .table-row--bad { background: #fde9e9; border-color: #f2c5c5; }
        .col-name { font-weight: 500; color: #3a3e2d; }
        .col-role { color: #6b6458; }
        .day-chips { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-start; }
        .day-chip { display: inline-flex; align-items: center; gap: 2px; border-radius: 999px; padding: 2px 6px; font-size: 10px; border: 1px solid #d3ccbf; background: #f7f2e9; }
        .day-chip--yes { background: #edf5e3; border-color: #d0e2bc; }
        .day-chip--no { background: #f7f2e9; border-color: #ddd0bf; }
        .day-chip-label { font-weight: 500; color: #3a3e2d; }
        .day-chip-value { color: #746b5e; }
        .status-pill { border-radius: 999px; padding: 2px 8px; font-size: 11px; }
        .status-pill--ok { background: #d8ead1; color: #355a32; }
        .status-pill--pending { background: #f7e2c1; color: #7b5b29; }
        .status-pill--bad { background: #f6c7c7; color: #7a2020; }
        .action-button { border-radius: 999px; border: none; padding: 3px 9px; font-size: 11px; cursor: pointer; margin-left: 4px; }
        .action-button--ok { background: #4f553d; color: #f5f3ef; }
        .action-button--bad { background: #b14444; color: #fdf3f3; }
        .action-link { border: none; background: none; color: #6b6458; font-size: 11px; text-decoration: underline; cursor: pointer; }
        .action-note { font-size: 11px; color: #7a3a3a; }
        .empty-text { font-size: 12px; color: #6b6458; margin: 6px 2px; }
        .status-msg { margin-top: 10px; font-size: 11px; color: #4b4336; }
        @media (max-width: 900px) {
          .table-head, .table-row { grid-template-columns: 1.6fr 1fr; grid-template-rows: auto auto auto; }
          .col-days, .col-status, .col-actions { margin-top: 4px; }
          .table-head .col-days, .table-head .col-status, .table-head .col-actions { display: none; }
        }
      `}</style>
    </main>
  );
}
