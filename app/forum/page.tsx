'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
export default function Forum(){
  const [threads,setThreads]=useState<any[]>([]);
  useEffect(()=>{(async()=>{
    const { data } = await supabase.from('forum_threads').select('*').order('created_at',{ascending:false});
    setThreads(data||[]);
  })();},[]);
  return (<main className="max-w-3xl mx-auto p-4">
    <h1 className="text-xl font-bold mb-4">פורום צוות</h1>
    <div className="space-y-2">
      {threads.map(t=>(<div key={t.id} className="rounded border bg-white p-3"><div className="font-semibold">{t.title}</div><div className="text-sm text-gray-600">{t.category} • {new Date(t.created_at).toLocaleString()}</div></div>))}
      {threads.length===0 && <p className="text-gray-600">אין פוסטים עדיין</p>}
    </div>
  </main>);
}