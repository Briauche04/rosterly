// app/rosterly/forum/ForumClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Thread = {
  id: number;
  title: string | null;
  category: string | null;
  status: string | null;
  created_at: string | null;
};

export default function ForumClient({ lang }: { lang: string }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      const { data, error } = await supabase
        .from('forum_threads')
        .select('id, title, category, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) setErr('שגיאה בטעינת הפורום');
      setThreads(data ?? []);
      setLoading(false);
    })();
  }, [lang]);

  return (
    <main className="landing-main" dir="rtl">
      <img src="/logo.png" alt="Rosterly" className="logo" />
      <h2>פורום צוות</h2>
      <h3>הודעות, עדכונים ושאלות של הצוות.</h3>

      <section className="landing-cards" style={{ maxWidth: 900, margin: '0 auto' }}>
        {loading && (
          <div className="landing-card"><div className="landing-card-bottom">טוען…</div></div>
        )}
        {err && (
          <div className="landing-card"><div className="landing-card-bottom">{err}</div></div>
        )}
        {!loading && !err && threads.length === 0 && (
          <div className="landing-card"><div className="landing-card-bottom">אין עדיין שרשורים.</div></div>
        )}

        {!loading && !err && threads.map(t => (
          <div key={t.id} className="landing-card">
            <div className="landing-card-top">
              <span className="btn pill">{t.category ?? 'כללי'}</span>
              {t.status && <span className="btn pill" style={{ marginInlineStart: 8 }}>{t.status}</span>}
            </div>
            <div className="landing-card-bottom">
              <div style={{ fontWeight: 600 }}>{t.title ?? 'ללא כותרת'}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{new Date(t.created_at ?? '').toLocaleString('he-IL')}</div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
