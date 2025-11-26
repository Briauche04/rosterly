'use client';

import { STR, useLang } from '../i18n';

type Props = {
  searchParams: any;
};

export default function ForumPage({ searchParams }: Props) {
  const lang = useLang(searchParams);
  const t = STR[lang];

  return (
    <div className={t.dir === 'rtl' ? 'rtl' : ''}>
      {/* Header + footer now come from rosterly/layout.tsx + RosterlyShell */}
      <main className="landing-main">
        <img src="/logo.png" alt="Rosterly Logo" className="logo" />
        <h2>{t.forum}</h2>
        <h3>{t.empty}</h3>

        <div className="action-card" style={{ marginTop: '16px' }}>
          <header>#forum</header>
          <p>
            בקרוב: פורום לצוות, טיפים למשמרות, שיתוף רעיונות לשיפור העבודה
            וחלוקת סידורים בין חנויות.
          </p>
        </div>
      </main>
    </div>
  );
}
