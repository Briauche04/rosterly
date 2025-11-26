// app/manager/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { STR, useLang } from '@/app/rosterly/i18n';

// Uses the IDENTICAL landing DOM + classes – no extra CSS here.
export default function ManagerHome() {
  const searchParams = useSearchParams();
  const lang = useLang(searchParams);
  const t = STR[lang];

  return (
    <div className={t.dir === 'rtl' ? 'rtl' : ''}>
      {/* MAIN CONTENT ONLY – header/footer come from RosterlyShell */}
      <main className="landing-main">
        <img src="/logo.png" alt="Rosterly" className="logo" />

        <section className="hero">
          <h1 className="title">כלי מנהלים</h1>
          <p className="subtitle">אישור הגשות, ניהול צוות וסידור שבועי — במקום אחד.</p>
        </section>

        <a href="/manager/submissions">
          <div className="action-card">
            <header>אישור הגשות</header>
            <p>סקירת הגשות שבועיות, אישור/דחייה וניהול סטטוסים.</p>
          </div>
        </a>

        <a href="/manager/staff">
          <div className="action-card">
            <header>ניהול צוות</header>
            <p>יצירה, עדכון והפעלת עובדים, טלפונים ותפקידים.</p>
          </div>
        </a>
      </main>
    </div>
  );
}
