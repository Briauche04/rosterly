// app/submit/page.tsx  (SERVER)
import SubmitClient from './SubmitClient';

export default function Page({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const lang = typeof searchParams.lang === 'string' ? searchParams.lang : 'he';
  return <SubmitClient lang={lang} />;
}
