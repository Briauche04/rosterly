// app/manager/generate/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * Next.js 15 requires a Suspense boundary around any component that calls
 * useSearchParams()/usePathname()/useRouter() during CSR bailout.
 * We keep your logic intact inside <GenerateInner/>.
 */
export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <main className="landing-main" dir="rtl">
          <p>טוען…</p>
        </main>
      }
    >
      <GenerateInner />
    </Suspense>
  );
}

function GenerateInner() {
  const searchParams = useSearchParams(); // ✅ now inside Suspense

  // ---- Your existing code starts here ----
  // Example: keep whatever you already had below (queries, effects, UI)
  // If you were reading query string:
  const week = searchParams.get('week') ?? '';

  // If the page depended on auth/roles, your current code can stay as-is.
  // (left minimal here so it compiles even before you paste your logic)

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
            <div>המשך בלוגיקה הקיימת שלך כאן…</div>
          </div>
        </div>
      </section>
    </main>
  );
}
