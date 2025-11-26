// app/rosterly/login/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const EMAIL_DOMAIN =
  process.env.NEXT_PUBLIC_LOGIN_EMAIL_DOMAIN?.trim() || 'rosterly.local';

function nationalIdToEmail(nationalId: string): string {
  // why: legacy scheme "trick" – national ID is the local-part of the auth email
  const local = String(nationalId).replace(/\s+/g, '');
  return `${local}@${EMAIL_DOMAIN}`;
}

export default function RosterlyLoginPage() {
  const router = useRouter();

  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setCurrentEmail(data.user?.email ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setStatus('');
    if (!nationalId || !phone) {
      setStatus('נא למלא ת״ז וטלפון.');
      return;
    }
    setBusy(true);
    try {
      const email = nationalIdToEmail(nationalId);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: phone,
      });
      if (error) {
        setStatus('כניסה נכשלה: ' + error.message);
        return;
      }
      setStatus('מחובר/ת בהצלחה, מעביר/ה…');
      router.replace('/rosterly');
    } catch {
      setStatus('שגיאת מערכת. נסו שוב.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await supabase.auth.signOut();
      setCurrentEmail(null);
      setStatus('נותקת בהצלחה.');
    } finally {
      setBusy(false);
    }
  }

  const goHome = () => router.push('/rosterly');

  if (loading) {
    return (
      <div className="login-page">
        <div className="center-card">טוען…</div>
        <style jsx>{`
          .login-page {
            min-height: 100vh;
            background: #f5f3ef;
            display: flex;
            justify-content: center;
          }
          .center-card {
            margin: 140px auto 0;
            max-width: 460px;
            padding: 20px 24px;
            border-radius: 18px;
            background: #f0e7d8;
            text-align: center;
            font-size: 14px;
            color: #4f553d;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* No local navbar – global header comes from RosterlyShell */}
      <div className="content">
        <section className="hero">
          <div className="logo-card">
            <img src="/logo-rosterly.svg" alt="Rosterly" className="logo-img" />
          </div>
          <h1 className="hero-title">כניסה</h1>
          <p className="hero-subtitle">ת״ז + טלפון (כסיסמה).</p>
        </section>

        <section className="card">
          {currentEmail ? (
            <>
              <h2 className="card-title">את/ה כבר מחובר/ת</h2>
              <p className="card-text">
                מחובר/ת כ־ <strong>{currentEmail}</strong>.
              </p>
              <div className="logged-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={goHome}
                >
                  חזרה לעמוד הראשי
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleLogout}
                  disabled={busy}
                >
                  התנתקות
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleLogin} className="form">
              <label className="field">
                <span>תעודת זהות</span>
                <input
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="לדוגמה: 012345678"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>טלפון (סיסמה)</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="לדוגמה: 0501234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </label>
              <p className="hint">
                נבנה אימייל: <code>{nationalId || 'ID'}</code>@{EMAIL_DOMAIN}
              </p>
              <button type="submit" className="primary-button" disabled={busy}>
                {busy ? 'נכנס/ת…' : 'כניסה'}
              </button>
              {status && <p className="status">{status}</p>}
            </form>
          )}
        </section>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: #f5f3ef;
          display: flex;
          justify-content: center;
        }
        .content {
          width: 100%;
          max-width: 720px;
          padding: 24px;
          text-align: center;
        }
        .hero {
          margin: 16px 0 24px;
        }
        .logo-card {
          width: 96px;
          height: 96px;
          margin: 0 auto 12px;
          border-radius: 24px;
          background: #f0e7d8;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-img {
          width: 62px;
        }
        .hero-title {
          margin: 0 0 6px;
          color: #3a3e2d;
        }
        .hero-subtitle {
          margin: 0;
          color: #777;
          font-size: 13px;
        }
        .card {
          background: #efe6d8;
          border-radius: 18px;
          padding: 18px 22px;
          text-align: right;
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.03);
        }
        .card-title {
          margin: 0 0 10px;
          font-size: 16px;
          color: #3a3e2d;
        }
        .card-text {
          margin: 0 0 12px;
          font-size: 13px;
          color: #6b6458;
        }
        .form {
          display: grid;
          gap: 10px;
        }
        .field {
          display: grid;
          gap: 4px;
          font-size: 12px;
          color: #3a3e2d;
        }
        .field input {
          border: 1px solid #d9cfbf;
          background: #f7f2e9;
          border-radius: 12px;
          padding: 8px 10px;
        }
        .primary-button {
          border: none;
          padding: 8px 22px;
          border-radius: 999px;
          background: #4f553d;
          color: #f5f3ef;
          cursor: pointer;
        }
        .secondary-button {
          border: 1px solid #d3ccbf;
          padding: 8px 16px;
          border-radius: 999px;
          background: #f7f2e9;
          color: #746b5e;
        }
        .hint {
          margin: 0 0 6px;
          font-size: 11px;
          color: #6b6458;
          text-align: left;
        }
        .status {
          margin-top: 10px;
          font-size: 12px;
          color: #4b4336;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
