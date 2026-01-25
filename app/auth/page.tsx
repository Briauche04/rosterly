'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [msg, setMsg] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) router.replace('/?lang=he'); // ✅ Redirect to correct homepage
    })();
  }, [router]);

  // Handle login form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMsg(`⚠️ שגיאה: ${error.message}`);
    } else if (data?.session) {
      setMsg('✅ התחברת בהצלחה. מעביר למסך הראשי…');
      setTimeout(() => router.push('/?lang=he'), 1500); // ✅ Redirect to main page
    }
  }

  return (
    <section className="page">
      <div className="page-inner center-card">
        <h2 style={{ marginTop: 0 }}>כניסה</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="email">אימייל</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-row">
            <label htmlFor="password">סיסמה</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="login-btn">
            התחבר
          </button>
        </form>
        {msg && <p style={{ marginTop: '1rem' }}>{msg}</p>}
      </div>
    </section>
  );
}
