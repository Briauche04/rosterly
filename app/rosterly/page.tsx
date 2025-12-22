// app/rosterly/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0; // avoid serving a prerendered (empty) shell
import RosterlyHomeClient from './RosterlyHomeClient';

export default function Page({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const lang = typeof searchParams.lang === 'string' ? searchParams.lang : 'he';
  return <RosterlyHomeClient lang={lang} />;
}


