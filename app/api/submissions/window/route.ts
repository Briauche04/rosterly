export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// Utility to get the **current week Sunday** date in local time
function startOfWeekSunday(d = new Date()) {
  const day = d.getDay(); // 0=Sun
  const sunday = new Date(d);
  sunday.setDate(sunday.getDate() - day);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

export async function GET() {
  // IMPORTANT: Assume server time is correct (Vercel region). Adjust tz if needed.
  const now = new Date();

  const sunday = startOfWeekSunday(now);
  const openStart = new Date(sunday); openStart.setHours(6, 0, 0, 0); // Sun 06:00
  const tue = new Date(sunday); tue.setDate(tue.getDate() + 2);
  const closeHard = new Date(tue); closeHard.setHours(12, 0, 0, 0);   // Tue 12:00

  const isOpen = now >= openStart && now <= closeHard;
  const status = isOpen ? 'OPEN' : 'LATE';

  return NextResponse.json({
    ok: true,
    now: now.toISOString(),
    window: { open_start: openStart.toISOString(), close_hard: closeHard.toISOString() },
    status,                   // "OPEN" or "LATE"
    requiresManagerApproval: !isOpen
  });
}