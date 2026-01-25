import './rosterly.css';
import { Suspense } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <Suspense fallback={<main className="landing-main" dir="rtl"><p>טוען…</p></main>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
