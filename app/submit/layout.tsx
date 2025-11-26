// app/submit/layout.tsx
// Reuse the Rosterly shell + styles so the /submit page gets the same navbar/footer.
import "../rosterly/rosterly.css";               // why: keep visual parity with rosterly pages
import type { ReactNode } from "react";
import RosterlyShell from "../rosterly/RosterlyShell";

export const metadata = {
  title: "Rosterly — Submit Availability",
};

export default function SubmitLayout({ children }: { children: ReactNode }) {
  return <RosterlyShell>{children}</RosterlyShell>;
}
