'use client';

import { useSearchParams } from 'next/navigation';
import { STR, useLang } from './i18n';
import { useIsManager } from '@/app/hooks/useIsManager';

export default function RosterlyHomeClient() {
  const searchParams = useSearchParams();
  const lang = useLang(searchParams);
  const t = STR[lang];
  const isManager = useIsManager();

  return (
    <div className={t.dir === 'rtl' ? 'rtl' : ''}>
      {/* MAIN CONTENT ONLY – HEADER & FOOTER COME FROM RosterlyShell */}
      <main className="landing-main">
        {/* HERO SECTION */}
        <section className="hero">
          <h1>{t.hero_title}</h1>
          <p>{t.hero_sub}</p>
        </section>

        {/* CARDS GRID */}
        <section className="actions-grid">
          {/* 1) Submit availability */}
          <a href={`/submit?lang=${lang}`}>
            <div className="action-card primary">
              <header>{t.card_submit_title}</header>
              <p>{t.card_submit_body}</p>
            </div>
          </a>

          {/* 2) Tutorials */}
          <a href={`/tutorials?lang=${lang}`}>
            <div className="action-card secondary">
              <header>{t.tutorials}</header>
              <p>{t.card_tutorials_body}</p>
            </div>
          </a>

          {/* 3) Forum */}
          <a href={`/forum?lang=${lang}`}>
            <div className="action-card secondary">
              <header>{t.forum}</header>
              <p>{t.card_forum_body}</p>
            </div>
          </a>

          {/* 4) Team */}
          <a href={`/team?lang=${lang}`}>
            <div className="action-card secondary">
              <header>{t.team}</header>
              <p>{t.card_team_body}</p>
            </div>
          </a>

          {/* 5) Manager tools – ONLY if manager/admin */}
          {isManager && (
            <a href="/manager">
              <div className="action-card manager-card">
                <header>{t.card_schedule_title}</header>
                <p>{t.card_schedule_body}</p>
              </div>
            </a>
          )}
        </section>
      </main>
    </div>
  );
}
