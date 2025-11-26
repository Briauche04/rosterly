// app/submit/layout.tsx  (SERVER — provides Suspense boundary for CSR bailout)
import { Suspense } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="landing-main" dir="rtl"><p>טוען…</p></main>}>
      {children}
    </Suspense>
  );
}
