// app/rosterly/tutorials/page.tsx
'use client';

import { STR, useLang } from '../i18n';

type Props = {
  searchParams: { lang?: string };
};

export default function TutorialsPage({ searchParams }: Props) {
  const lang = useLang(searchParams);
  const t = STR[lang];

  return (
    // RosterlyShell already wraps with <div className={t.dir === 'rtl' ? 'rtl' : ''}>
    <section className="hero">
      <div className="container">
        <h1 className="title">{t.tutorials}</h1>
        <p className="subtitle">{t.empty}</p>

        <div className="card" style={{ marginTop: 16 }}>
          #tutorials • placeholder
        </div>
      </div>
    </section>
  );
}
