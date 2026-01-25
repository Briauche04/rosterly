// app/tutorials/page.tsx

import Image from 'next/image';
import { STR } from '../STR'; // ✅ fixed import
import type { Lang } from '../i18n';

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function TutorialsPage({ searchParams }: Props) {
  const rawLang = searchParams?.lang;
  const lang: Lang = rawLang === 'en' || rawLang === 'he' ? rawLang : 'he';
  const t = STR[lang];

  return (
    <main className="landing-main">
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="Rosterly"
        width={160}
        height={160}
        className="logo"
      />

      {/* Title + Subtitle */}
      <h2>{t.tutorials_title}</h2>
      <h3>{t.tutorials_subtitle}</h3>

      {/* Content */}
      <div className="landing-cards">
        <div className="action-card">
          <header>{t.tutorials_placeholder_title}</header>
          <p>{t.tutorials_placeholder_text}</p>
        </div>
      </div>
    </main>
  );
}
