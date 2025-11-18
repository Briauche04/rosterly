'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
export default function Team(){
  const [rows,setRows]=useState<any[]>([]);
  useEffect(()=>{(async()=>{
    const { data } = await supabase.from('employees').select('full_name, role, phone').eq('active',true).order('full_name');
    setRows(data||[]);
  })();},[]);
  return (<main className="max-w-3xl mx-auto p-4">
    <h1 className="text-xl font-bold mb-4">צוות</h1>
    <div className="space-y-2">
      {rows.map((e,i)=>(<div key={i} className="rounded border bg-white p-3 flex items-center justify-between">
        <div className="font-medium">{e.full_name}</div><div className="text-sm text-gray-600">{e.role}</div>
      </div>))}
    </div>
  </main>);
}