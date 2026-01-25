'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RosterlyShell({
  children,
  showManager = true,
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

  const handleLoginClick = () => goto('/login');
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    router.refresh();
  };

  return (
    <div dir="rtl">
      {/* Desktop nav */}
      <nav className="top-nav rs-desktop-nav">
        <div className="nav-logo" onClick={() => goto('/')}>
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
          <a href={`/team?lang=${lang}`}>צוות</a>
          <a href={`/forum?lang=${lang}`}>פורום</a>
          <a href={`/tutorials?lang=${lang}`}>מדריכים</a>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="landing-footer rs-desktop-footer">
        <small>Privacy • Terms</small>
        <br />
        <small>Rosterly © {new Date().getFullYear()}</small>
      </footer>

      {/* Mobile tab bar */}
      <nav className="rs-mobile-tabs" aria-label="ניווט תחתון">
        <button className="rs-tab" onClick={() => goto('/')}>
          <span className="rs-tab-ico" aria-hidden>🏠</span>
          <span className="rs-tab-l">ראשית</span>
        </button>
        <button className="rs-tab" onClick={() => goto('/tutorials')}>
          <span className="rs-tab-ico" aria-hidden>🎓</span>
          <span className="rs-tab-l">מדריכים</span>
        </button>
        <button className="rs-tab" onClick={() => goto('/forum')}>
          <span className="rs-tab-ico" aria-hidden>💬</span>
          <span className="rs-tab-l">פורום</span>
        </button>
        <button className="rs-tab" onClick={() => goto('/team')}>
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

      {/* Keep the mobile tab styles */}
      <style jsx>{`/* ... existing tab styles ... */`}</style>
    </div>
  );
}
