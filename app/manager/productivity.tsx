'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Productivity() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('weekly_forecasts')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(6);
      if (!error) setRows(data);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-4">פריון שבועי</h1>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">שבוע</th>
              <th className="p-2 border">יעד פריון</th>
              <th className="p-2 border">סה״כ שעות</th>
              <th className="p-2 border">סה״כ מכירות</th>
              <th className="p-2 border">פריון בפועל</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td className="border p-2">{r.week_start}</td>
                <td className="border p-2">{r.target_productivity}</td>
                <td className="border p-2">{r.total_hours ?? '-'}</td>
                <td className="border p-2">{r.total_sales ?? '-'}</td>
                <td className="border p-2 font-semibold">{r.productivity ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
