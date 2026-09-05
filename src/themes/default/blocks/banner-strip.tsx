'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { useGatedCta } from '@/shared/hooks/use-gated-cta';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function BannerStrip({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const { handleCtaClick } = useGatedCta();
  const items = section.items || [];

  return (
    <section
      id={section.id}
      className={cn('py-4 sm:py-5', section.className, className)}
    >
      <div className="mx-auto max-w-[1630px] px-4 sm:px-8 lg:px-12">
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map((item: any, index: number) => (
            <Link
              key={item.title || index}
              href={item.url || '/chat'}
              className="group relative aspect-[2.75/1] overflow-hidden rounded-2xl border border-[rgba(24,22,31,.08)] bg-[#f0f1f7] shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={(event) => {
                if (item.url?.startsWith('/')) {
                  event.preventDefault();
                  void handleCtaClick(item.url || '/chat');
                }
              }}
            >
              {item.image?.src && (
                <Image
                  src={item.image.src}
                  alt={item.image.alt || item.title || ''}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-black/0" />
              <div className="absolute inset-0 flex max-w-[72%] flex-col justify-center gap-1 p-5 text-white sm:p-7">
                <p className="text-[10px] font-medium tracking-[0.15em] text-white/65 uppercase sm:text-xs">
                  {item.label || 'H3 Max Director'}
                </p>
                <h2 className="font-display text-base leading-tight font-semibold sm:text-2xl">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="mt-1 hidden text-xs leading-5 text-white/75 sm:block">
                    {item.description}
                  </p>
                )}
              </div>
              <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-xl bg-white/15 text-white backdrop-blur transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:top-4 sm:right-4">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
