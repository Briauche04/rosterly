// app/submit/layout.tsx
import '../rosterly.css'; // ✅ FIXED path
import RosterlyShell from '../RosterlyShell'; // ✅ use shell to apply nav and layout

export const metadata = {
  title: 'Rosterly',
  description: 'Submit shifts and view schedules',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RosterlyShell>{children}</RosterlyShell>;
}
