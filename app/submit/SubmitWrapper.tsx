// app/submit/SubmitWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const SubmitClient = dynamic(() => import('./SubmitClient'));

export default function SubmitWrapper({ lang }: { lang: string }) {
  return <SubmitClient lang={lang} />;
}
