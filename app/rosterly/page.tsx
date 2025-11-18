'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STR, useLang } from "./i18n";
import { supabase } from "@/lib/supabase";

export default function Page({ searchParams }: { searchParams: any }) {
  const lang = useLang(searchParams);
  const t = STR[lang];

  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setEmail(data.user.email ?? null);
      } else {
        setEmail(null);
      }
    })();
  }, []);

  const handleLoginClick = () => {
    if (email) {
      // Logged in → go to dashboard
      router.push("/dashboard");
    } else {
      // Not logged in → go to login page (same as your current link)
      router.push(`/rosterly/login?lang=${lang}`);
    }
  };

  return (
    <div className={t.dir === "rtl" ? "rtl" : ""}>
      {/* Top navigation */}
      <nav className="top-nav">
        <div
          className="nav-logo"
          style={{ cursor: "pointer" }}
          onClick={() => router.push(`/rosterly?lang=${lang}`)}
        >
          Rosterly
        </div>
        <div className="nav-links">
          <button className="login-btn" type="button" onClick={handleLoginClick}>
            {email ? "מחובר/ת" : t.login}
          </button>
          <a href={`/rosterly/team?lang=${lang}`}>{t.team}</a>
          <a href={`/rosterly/forum?lang=${lang}`}>{t.forum}</a>
          <a href={`/rosterly/tutorials?lang=${lang}`}>{t.tutorials}</a>
        </div>
      </nav>

      {/* Main content – your logo + action cards */}
      <main className="landing-main">
        <img src="/logo.png" alt="Rosterly Logo" className="logo" />
        <h2>{t.hero_title}</h2>
        <h3>{t.hero_sub}</h3>

        <a href="/submit">
          <div className="action-card">
            <header>{t.card_submit_title}</header>
            <p>{t.card_submit_body}</p>
          </div>
        </a>

        <a href="/manager">
          <div className="action-card">
            <header>{t.card_schedule_title}</header>
            <p>{t.card_schedule_body}</p>
          </div>
        </a>

        <a href="/rosterly/forum">
          <div className="action-card">
            <header>{t.card_forum_title}</header>
            <p>{t.card_forum_body}</p>
          </div>
        </a>

        {/* Manager tools card – already added */}
        <a href="/manager/submissions">
          <div className="action-card manager-card">
            <header>כלי מנהלים</header>
            <p>
              צפייה ואישור של הגשות המשמרות, סימון תקין/נדחה והפקת סידור שבועי קריא.
            </p>
          </div>
        </a>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <small>Privacy • Terms</small>
        <br />
        <small>Rosterly 2025 ©</small>
      </footer>
    </div>
  );
}
