'use client';

import { useSearchParams } from 'next/navigation';
import { STR, useLang } from './i18n';
import { useIsManager } from '@/app/hooks/useIsManager';

export default function RosterlyHomePage() {
  const searchParams = useSearchParams();
  const lang = useLang(searchParams);
  const t = STR[lang];
  const isManager = useIsManager();

  return (
    <div className={t.dir === 'rtl' ? 'rtl' : ''}>
      {/* MAIN CONTENT ONLY – HEADER & FOOTER COME FROM RosterlyShell */}
      <main className="landing-main">
        <img src="/logo.png" alt="Rosterly Logo" className="logo" />

        <section className="hero">
          <h1 className="title">{t.hero_title}</h1>
          <p className="subtitle">{t.hero_sub}</p>
        </section>

        {/* Keep your existing three cards unchanged */}
        <a href="/submit">
          <div className="action-card">
            <header>{t.card_submit_title}</header>
            <p>{t.card_submit_body}</p>
          </div>
        </a>

        <a href="/rosterly/tutorials">
          <div className="action-card">
            <header>{t.tutorials}</header>
            <p>{t.card_forum_body}</p>
          </div>
        </a>

        <a href="/rosterly/forum">
          <div className="action-card">
            <header>{t.card_forum_title ?? t.forum}</header>
            <p>{t.card_forum_body}</p>
          </div>
        </a>

        {/* Show Manager tools only for manager/admin. 
            Keep EXACT classes/markup so design stays identical. */}
        {isManager && (
          <a href="/manager">
            <div className="action-card manager-card">
              <header>{t.card_schedule_title}</header>
              <p>{t.card_schedule_body}</p>
            </div>
          </a>
        )}
      </main>
    </div>
  );
}