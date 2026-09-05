import { envConfigs } from '@/config';
import { BrandLogo } from '@/shared/blocks/common';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark h3-brand bg-background relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-24 text-foreground">
      <div className="bg-primary/15 pointer-events-none absolute -top-48 -right-32 size-[34rem] rounded-full blur-3xl" />
      <div className="absolute top-5 left-5 sm:top-8 sm:left-8">
        <BrandLogo
          brand={{
            title: envConfigs.app_name,
            logo: {
              src: envConfigs.app_logo,
              alt: envConfigs.app_name,
            },
            url: '/',
            target: '_self',
            className: '',
          }}
        />
      </div>
      <div className="relative w-full">{children}</div>
    </div>
  );
}
