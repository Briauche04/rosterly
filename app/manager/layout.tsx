// app/manager/layout.tsx
'use client';

import type { ReactNode } from 'react';
import RosterlyShell from '@/app/rosterly/RosterlyShell';
import ManagerGate from './ManagerGate';

// IMPORTANT: pull in the same stylesheet used by the Rosterly landing
// If your file lives elsewhere, change the path accordingly.
import '@/app/rosterly/rosterly.css';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  // Shell (top-nav / spacing / footer) stays 1:1 with Rosterly main
  return (
    <RosterlyShell>
      <ManagerGate>{children}</ManagerGate>
    </RosterlyShell>
  );
}
