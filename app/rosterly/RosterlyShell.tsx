// app/rosterly/RosterlyShell.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RosterlyShell({
  children,
  showManager = true, // flip to false if you want to hide the Manager tab
}: {
  children: React.ReactNode;
  showManager?: boolean;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const lang = (search?.get('lang') ?? 'he').toLowerCase();

  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    })();
  }, []);

  const goto = (href: string) =>
    router.push(`${href}${href.includes('?') ? '' : `?lang=${lang}`}`);

  const handleLoginClick = () => goto('/rosterly/login');
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    router.refresh();
  };

  return (
    <div dir="rtl">
      {/* ===== DESKTOP NAV (UNCHANGED MARKUP/CLASSES) ===== */}
      <nav className="top-nav rs-desktop-nav">
        <div
          className="nav-logo"
          style={{ cursor: 'pointer' }}
          onClick={() => goto('/rosterly')}
        >
          Rosterly
        </div>
        <div className="nav-links">
          {email ? (
            <>
              <span className="login-btn">{email}</span>
              <button className="login-btn" onClick={handleLogout}>
                התנתקות
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={handleLoginClick}>
              להתחבר
            </button>
          )}
          <a href={`/rosterly/team?lang=${lang}`}>צוות</a>
          <a href={`/rosterly/forum?lang=${lang}`}>פורום</a>
          <a href={`/rosterly/tutorials?lang=${lang}`}>מדריכים</a>
        </div>
      </nav>

      {/* ===== PAGE CONTENT ===== */}
      <main>{children}</main>

      {/* ===== DESKTOP FOOTER (unchanged) ===== */}
      <footer className="landing-footer rs-desktop-footer">
        <small>Privacy • Terms</small>
        <br />
        <small>Rosterly © {new Date().getFullYear()}</small>
      </footer>

      {/* ===== MOBILE TABS (PHONE ONLY) ===== */}
      <nav className="rs-mobile-tabs" aria-label="ניווט תחתון">
        <button className="rs-tab" onClick={() => goto('/rosterly')}>
          <span className="rs-tab-ico" aria-hidden>🏠</span>
          <span className="rs-tab-l">ראשית</span>
        </button>
        <button className="rs-tab" onClick={() => goto('/rosterly/tutorials')}>
          <span className="rs-tab-ico" aria-hidden>🎓</span>
          <span className="rs-tab-l">מדריכים</span>
        </button>
        <button className="rs-tab" onClick={() => goto('/rosterly/forum')}>
          <span className="rs-tab-ico" aria-hidden>💬</span>
          <span className="rs-tab-l">פורום</span>
        </button>
        <button className="rs-tab" onClick={() => goto('/rosterly/team')}>
          <span className="rs-tab-ico" aria-hidden>👥</span>
          <span className="rs-tab-l">צוות</span>
        </button>
        {showManager && (
          <button className="rs-tab" onClick={() => goto('/manager')}>
            <span className="rs-tab-ico" aria-hidden>🛠️</span>
            <span className="rs-tab-l">מנהלים</span>
          </button>
        )}
      </nav>

      <style jsx>{`
        /* PHONE-ONLY bottom tabs (uses Rosterly colors) */
        .rs-mobile-tabs {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          display: none; /* default hidden, shown on phones */
          background: #efe6d8;
          border-top: 1px solid #e3dacb;
          padding: 6px 8px;
          gap: 6px;
          z-index: 50;
        }
        .rs-tab {
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 8px 6px;
          border-radius: 12px;
          background: #f7f2e9;
          border: 1px solid #e3dacb;
          font-size: 11px;
          color: #4f553d;
        }
        .rs-tab-ico {
          line-height: 1;
          font-size: 16px;
        }
        .rs-tab-l {
          font-size: 10px;
        }

        /* Only change layout under 640px: hide desktop nav/footer, show tabs */
        @media (max-width: 640px) {
          .rs-desktop-nav {
            display: none; /* hide the top bar only on phones */
          }
          .rs-desktop-footer {
            display: none;
          }
          .rs-mobile-tabs {
            display: flex; /* show phones tab bar */
          }
          main {
            padding-bottom: 110px; /* leave space for the tab bar */
          }
        }
      `}</style>
    </div>
  );
}
