'use client';

import Link from 'next/link';
import Image from 'next/image';
import { STR } from '../i18n';
import type { Lang } from '../i18n';

interface Props {
  lang?: Lang;
}

export default function RosterlyHomeClient({ lang = 'he' }: Props) {
  const t = STR[lang];

  return (
    <main className="landing-main" dir="rtl">
      {/* Logo */}
      <Image src="/logo.png" alt="Rosterly" className="logo" width={160} height={160} />

      {/* Headings */}
      <h2>{t.home_title}</h2>
      <h3>{t.home_subtitle}</h3>

      {/* Cards Section */}
      <section className="landing-cards">
        {/* Submit Card */}
        <Link href="/submit" className="action-card">
          <header>{t.submit_card_title}</header>
          <p>{t.submit_card_description}</p>
        </Link>

        {/* Reminders */}
        <Link href="/reminders" className="action-card">
          <header>{t.reminders_card_title}</header>
          <p>{t.reminders_card_description}</p>
        </Link>

        {/* Team Page */}
        <Link href="/team" className="action-card">
          <header>{t.team_card_title}</header>
          <p>{t.team_card_description}</p>
        </Link>

        {/* Manager Area */}
        <Link href="/manager" className="action-card manager-card">
          <header>{t.manager_card_title}</header>
          <p>{t.manager_card_description}</p>
        </Link>

        {/* Forum */}
        <Link href="/forum" className="action-card">
          <header>{t.forum_card_title}</header>
          <p>{t.forum_card_description}</p>
        </Link>

        {/* Tutorials */}
        <Link href="/tutorials" className="action-card">
          <header>{t.tutorials_card_title}</header>
          <p>{t.tutorials_card_description}</p>
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">Rosterly &copy; 2026</footer>
    </main>
  );
}
