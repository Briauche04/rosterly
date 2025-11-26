// app/manager/generate/page.tsx
import GenerateClient from './GenerateClient';

export default function Page({
  searchParams,
}: { searchParams: { [k: string]: string | string[] | undefined } }) {
  const week = typeof searchParams.week === 'string' ? searchParams.week : '';
  return <GenerateClient week={week} />;
}
