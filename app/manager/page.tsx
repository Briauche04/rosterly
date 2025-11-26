// app/manager/page.tsx
import Link from 'next/link';
import { getAccessLevelServer } from '@/lib/access-server';

export const dynamic = 'force-dynamic';

export default async function ManagerHome() {
  const level = await getAccessLevelServer();
  const allowed = level === 'ADMIN' || level === 'MANAGER';

  if (!allowed) {
    return (
      <main className="landing-main" dir="rtl">
        <h2>אין לך הרשאות מנהל</h2>
        <p>פנה/י למנהל מערכת כדי להעניק הרשאות מתאימות.</p>
      </main>
    );
  }

  return (
    <main className="landing-main" dir="rtl">
      <img src="/logo.png" alt="Rosterly" className="logo" />
      <h2>כלי מנהלים</h2>
      <h3>אישור הגשות, ניהול צוות ועוד — במקום אחד.</h3>

      <section className="landing-cards" style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/manager/submissions" className="landing-card">
          <div className="landing-card-top"><span className="btn pill">אישור הגשות</span></div>
          <div className="landing-card-bottom">צפייה ואישור הגשות העובדים, סימון הערות וסטטוסים.</div>
        </Link>
        <Link href="/manager/staff" className="landing-card">
          <div className="landing-card-top"><span className="btn pill">ניהול צוות</span></div>
          <div className="landing-card-bottom">יצירה, עריכה והקפאה של עובדים, תפקידים והרשאות.</div>
        </Link>
      </section>
    </main>
  );
}
