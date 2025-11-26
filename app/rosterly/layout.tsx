import "./rosterly.css";
import type { ReactNode } from "react";
import RosterlyShell from "./RosterlyShell";

export const metadata = {
  title: "Rosterly",
};

export default function RosterlyLayout({ children }: { children: ReactNode }) {
  return <RosterlyShell>{children}</RosterlyShell>;
}
