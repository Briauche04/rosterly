'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/auth');
      } else {
        setUserEmail(data.user.email);
      }
    })();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ברוך הבא 👋
        </h1>
        {userEmail && (
          <p className="text-gray-700">מחובר כ־ <strong>{userEmail}</strong></p>
        )}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace('/auth');
          }}
          className="mt-4 rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
        >
          התנתק
        </button>
      </div>
    </div>
  );
}