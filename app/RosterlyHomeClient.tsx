'use client';

import Link from 'next/link';

export default function RosterlyHomeClient() {
  return (
    <main className="landing-main" dir="rtl">
      <img src="/logo.png" alt="Rosterly" className="logo" />
      <h2>Rosterly – הגשת משמרות</h2>
      <h3>הגשה, אישורים וסידור שבועי מסודר במקום אחד.</h3>

      <section className="landing-cards" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Link href="/submit" className="action-card">
          <div>
            <header>הגשת משמרת</header>
            <p>סימון זמינות לשבוע הקרוב בצורה ברורה ומדויקת.</p>
          </div>
        </Link>

        <Link href="/tutorials" className="action-card">
          <div>
            <header>מדריכים</header>
            <p>מקום לשאלות ועזרי לימוד לצוות החנות.</p>
          </div>
        </Link>

        <Link href="/forum" className="action-card">
          <div>
            <header>פורום</header>
            <p>מקום לשאלות ועדכונים לצוות החנות.</p>
          </div>
        </Link>

        <Link href="/manager" className="action-card manager-card">
          <div>
            <header>כלי מנהלים</header>
            <p>אישורי משמרות, סידור קבוע, כתיבה והפקת סדר שבועי.</p>
          </div>
        </Link>
      </section>
    </main>
  );
}
