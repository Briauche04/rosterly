'use client';

import RosterlyShell from './RosterlyShell';
import RosterlyHomeClient from './RosterlyHomeClient';

export default function Page() {
  return (
    <RosterlyShell>
      <RosterlyHomeClient />
    </RosterlyShell>
  );
}
