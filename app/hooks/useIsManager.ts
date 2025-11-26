'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useIsManager() {
  const [isManager, setIsManager] = useState(false);
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = u.user?.id;
        if (!uid) { if (!off) setIsManager(false); return; }
        const { data, error } = await supabase
          .from('user_roles')
          .select('role_code')
          .eq('user_uid', uid);
        if (error) { if (!off) setIsManager(false); return; }
        const roles = (data ?? []).map(r => r.role_code);
        if (!off) setIsManager(roles.includes('manager') || roles.includes('admin'));
      } catch { if (!off) setIsManager(false); }
    })();
    return () => { off = true; };
  }, []);
  return isManager;
}
