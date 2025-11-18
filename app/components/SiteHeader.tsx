'use client';
import Link from "next/link";
import { useEffect, useState } from "react";

type Roles = { roles: string[]; isManager: boolean };

export default function SiteHeader() {
  const [roles, setRoles] = useState<Roles>({ roles: [], isManager: false });

  useEffect(() => {
    fetch("/api/me/roles").then(r => r.json()).then(setRoles).catch(() => {});
  }, []);

  const emp = [
    { href: "/submit", label: "הגש משמרות" },
    { href: "/schedule", label: "המשמרות שלי" },
    { href: "/forum", label: "פורום" },
    { href: "/tutorials", label: "מדריכים" },
    { href: "/reminders", label: "תזכורות" },
    { href: "/team", label: "צוות" },
  ];
  const mgr = [
    { href: "/manager/schedule", label: "ניהול לוח" },
    { href: "/manager/reviews", label: "אישור הגשות" },
    { href: "/manager/forum", label: "פורום מנהלים" },
    { href: "/manager/analytics", label: "סטטיסטיקות" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-7xl px-6 flex items-center gap-6 py-3">
          <div className="ml-auto flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 24 24" className="text-[var(--olive)]">
              <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8"/>
              <circle cx="8" cy="11" r="1.2" fill="currentColor"/>
              <circle cx="12" cy="11" r="1.2" fill="currentColor"/>
              <circle cx="16" cy="11" r="1.2" fill="currentColor"/>
              <circle cx="8" cy="15" r="1.2" fill="currentColor"/>
              <circle cx="12" cy="15" r="1.2" fill="currentColor"/>
              <circle cx="16" cy="15" r="1.2" fill="currentColor"/>
            </svg>
            <span className="font-semibold tracking-wide">Rosterly</span>
          </div>
          <nav className="hidden md:flex mr-auto items-center gap-6">
            {emp.map(i => (
              <Link key={i.href} href={i.href} className="text-[15px] text-neutral-700 hover:text-neutral-900">
                {i.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 text-xs">
            <button className="px-2 py-1 rounded bg-white border">HE</button>
            <button className="px-2 py-1 rounded">EN</button>
            <button className="px-2 py-1 rounded">RU</button>
          </div>
        </div>
      </div>
      {roles.isManager && (
        <div className="border-b bg-[#F9F9F7]">
          <div className="mx-auto max-w-7xl px-6 flex items-center gap-6 py-2">
            <nav className="flex mr-auto items-center gap-6">
              {mgr.map(i => (
                <Link key={i.href} href={i.href} className="text-[14px] text-[#1C574F] hover:text-[#134A43]">
                  {i.label}
                </Link>
              ))}
            </nav>
            <span className="ml-auto text-xs text-[#1C574F]">סביבת מנהלים</span>
          </div>
        </div>
      )}
    </header>
  );
}
