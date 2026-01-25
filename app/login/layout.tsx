// app/rosterly/login/layout.tsx
import { Suspense } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="landing-main" dir="rtl"><p>טוען…</p></main>}>
      {children}
    </Suspense>
  );
}
