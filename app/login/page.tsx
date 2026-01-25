// app/rosterly/login/page.tsx
import LoginClient from './LoginClient';

export default function Page({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const lang = typeof searchParams.lang === 'string' ? searchParams.lang : 'he';
  return <LoginClient lang={lang} />;
}
