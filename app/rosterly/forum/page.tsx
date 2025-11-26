// app/rosterly/forum/page.tsx
import ForumClient from './ForumClient';

export default function Page({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const lang = typeof searchParams.lang === 'string' ? searchParams.lang : 'he';
  return <ForumClient lang={lang} />;
}
