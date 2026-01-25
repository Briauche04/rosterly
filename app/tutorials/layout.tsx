// app/tutorials/layout.tsx
import '../rosterly.css'; // ✅ correct relative path
import RosterlyShell from '../RosterlyShell';

export const metadata = {
  title: 'Tutorials • Rosterly',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RosterlyShell>{children}</RosterlyShell>;
}
