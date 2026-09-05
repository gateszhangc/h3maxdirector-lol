import { ReactNode } from 'react';

import { getThemeBlock } from '@/core/theme';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

export default async function LandingLayout({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: HeaderType;
  footer: FooterType;
}) {
  const Header = await getThemeBlock('header');
  const Footer = await getThemeBlock('footer');

  return (
    <div className="dark h3-brand bg-background min-h-screen w-full overflow-x-hidden text-foreground">
      <Header header={header} />
      <main>{children}</main>
      <Footer footer={footer} />
    </div>
  );
}
