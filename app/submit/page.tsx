// app/submit/page.tsx (Server Component)
import SubmitWrapper from './SubmitWrapper';

export default function Page({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const lang = typeof searchParams.lang === 'string' ? searchParams.lang : 'he';

  return <SubmitWrapper lang={lang} />;
}
