// app/rosterly/login/LoginClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginClient({ lang }: { lang: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) router.replace(`/rosterly?lang=${lang}`);
    })();
  }, [router, lang]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setBusy(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pwd,
      });
      if (error) {
        setStatus(error.message || 'שגיאה בהתחברות');
        return;
      }
      router.replace(`/rosterly?lang=${lang}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="landing-main" dir="rtl">
      <img src="/logo.png" alt="Rosterly" className="logo" />
      <h2>התחברות</h2>
      <h3>הזינו ת״ז (בתבנית אימייל) וסיסמה.</h3>

      <section className="landing-cards" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="landing-card">
          <div className="landing-card-top">
            <span className="btn pill">כניסה בסיסמה</span>
          </div>
          <div className="landing-card-bottom">
            <form onSubmit={handlePasswordLogin} style={{ display: 'grid', gap: 8 }}>
              <label style={{ fontSize: 12, color: '#6b6458' }}>אימייל</label>
              <input
                type="email"
                placeholder="123456789@rosterly.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: '1px solid #d9cfbf', background: '#f7f2e9' }}
              />
              <label style={{ fontSize: 12, color: '#6b6458' }}>סיסמה</label>
              <input
                type="password"
                placeholder="טלפון (ספרות בלבד)"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: '1px solid #d9cfbf', background: '#f7f2e9' }}
              />
              <button type="submit" className="btn" disabled={busy}>
                {busy ? 'מתחבר…' : 'כניסה'}
              </button>
              {status && <div style={{ fontSize: 12, color: '#7c2222' }}>{status}</div>}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
