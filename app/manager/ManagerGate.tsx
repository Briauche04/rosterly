'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ManagerGate({
  children,
  redirectOnFail = '/auth',
}: {
  children: React.ReactNode;
  redirectOnFail?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'ok' | 'unauth' | 'error'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) { if (!off) setState('unauth'); return; }
        const { data, error } = await supabase
          .from('user_roles')
          .select('role_code')
          .eq('user_uid', u.user.id);
        if (error) throw error;
        const roles = (data ?? []).map(r => r.role_code);
        const ok = roles.includes('manager') || roles.includes('admin');
        if (!off) setState(ok ? 'ok' : 'unauth');
      } catch (e: any) {
        if (!off) { setMsg(e?.message ?? 'authorization error'); setState('error'); }
      }
    })();
    return () => { off = true; };
  }, []);

  if (state === 'loading') {
    return (
      <main style={{minHeight:'50vh',display:'grid',placeItems:'center'}}>
        <div style={{fontSize:12,opacity:.7}}>טוען הרשאות…</div>
      </main>
    );
  }
  if (state === 'unauth') {
    if (typeof window !== 'undefined') setTimeout(() => router.replace(redirectOnFail), 600);
    return (
      <main style={{minHeight:'50vh',display:'grid',placeItems:'center'}}>
        <div style={{fontSize:13,color:'#7a6f5d'}}>אין הרשאת מנהל. מעביר/ה לעמוד ההתחברות…</div>
      </main>
    );
  }
  if (state === 'error') {
    return (
      <main style={{minHeight:'50vh',display:'grid',placeItems:'center'}}>
        <div style={{fontSize:12,color:'#b33'}}>שגיאה בבדיקת הרשאה: {msg}</div>
      </main>
    );
  }
  return <>{children}</>;
}
