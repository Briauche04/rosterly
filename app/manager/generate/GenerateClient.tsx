// app/manager/generate/GenerateClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function GenerateClient({ week }: { week: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // put any initial client logic here if you had some
  }, [week]);

  return (
    <main className="landing-main" dir="rtl">
      <img src="/logo.png" alt="Rosterly" className="logo" />
      <h2>יצירת סידור שבועי</h2>
      <h3>כלי ניהול ליצירה/עדכון סידור שבועי.</h3>

      <section className="landing-cards" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="landing-card">
          <div className="landing-card-top">
            <span className="btn pill">פרמטרים</span>
          </div>
          <div className="landing-card-bottom" style={{ lineHeight: 1.8 }}>
            <div><b>שבוע:</b> {week || '—'}</div>
            {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
