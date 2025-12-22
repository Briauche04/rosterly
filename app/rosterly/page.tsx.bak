// app/rosterly/page.tsx
import dynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Handles both default and named exports to avoid "is not a function"
const RosterlyHomeClient = dynamic(
  () =>
    import('./RosterlyHomeClient').then((m) => m.default ?? m.RosterlyHomeClient),
  { ssr: false }
);

export default function Page() {
  return <RosterlyHomeClient />;
}
