import { getTranslations, setRequestLocale } from 'next-intl/server';

import H3MaxHome from '@/themes/default/pages/h3max-home';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('landing');

  return <H3MaxHome header={t.raw('header')} footer={t.raw('footer')} />;
}
