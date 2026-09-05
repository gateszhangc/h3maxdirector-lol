import Image from 'next/image';

import { Link } from '@/core/i18n/navigation';
import { Brand as BrandType } from '@/shared/types/blocks/common';

export function BrandLogo({ brand }: { brand: BrandType }) {
  return (
    <Link
      href={brand.url || ''}
      target={brand.target || '_self'}
      className={`font-display flex items-center gap-2.5 ${brand.className || ''}`}
    >
      {brand.logo && (
        <Image
          src={brand.logo.src}
          alt={brand.title ? '' : brand.logo.alt || ''}
          width={brand.logo.width || 80}
          height={brand.logo.height || 80}
          className="h-8 w-auto"
          unoptimized={brand.logo.src.startsWith('http')}
        />
      )}
      {brand.title && (
        <span className="text-foreground text-lg font-semibold tracking-[0.02em]">
          {brand.title}
        </span>
      )}
    </Link>
  );
}
