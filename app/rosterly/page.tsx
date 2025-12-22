// app/rosterly/page.tsx
import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";
export const revalidate = 0; // prevent stale prerendered HTML

const RosterlyHomeClient = dynamic(
  () => import("./RosterlyHomeClient"),
  { ssr: false } // WHY: ensure client hydration runs in the browser
);

export default function Page() {
  return <RosterlyHomeClient />;
}
