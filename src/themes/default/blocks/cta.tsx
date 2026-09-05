'use client';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { useGatedCta } from '@/shared/hooks/use-gated-cta';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Cta({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const { getDisplayLabel, handleCtaClick } = useGatedCta();

  return (
    <section
      id={section.id}
      className={cn('py-12 sm:py-16', section.className, className)}
    >
      <div className="mx-auto max-w-[1630px] px-4 sm:px-8 lg:px-12">
        <div className="overflow-hidden rounded-[24px] bg-[#5856D6] px-6 py-12 text-center text-white shadow-[0_22px_54px_rgba(88,86,214,.22)] sm:px-12 sm:py-16">
          <h2 className="font-display text-4xl font-semibold tracking-[-0.025em] text-balance lg:text-5xl">
            {section.title}
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl text-white/75"
            dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
          />

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {section.buttons?.map((button, idx) => (
              <Button
                asChild
                size={button.size || 'default'}
                variant={button.variant || 'default'}
                className={cn(
                  'h-11 rounded-xl px-5 shadow-none',
                  button.variant === 'outline'
                    ? 'border-white/25 bg-white/10 text-white hover:bg-white/18'
                    : 'bg-white text-[#3F3EB5] hover:bg-[#F1F0FB]'
                )}
                key={idx}
              >
                <Link
                  href={button.url || ''}
                  target={button.target || '_self'}
                  onClick={(event) => {
                    if (
                      button.url?.startsWith('/') &&
                      button.url !== '/pricing'
                    ) {
                      event.preventDefault();
                      void handleCtaClick(button.url || '');
                    }
                  }}
                >
                  {button.icon && <SmartIcon name={button.icon as string} />}
                  <span>
                    {getDisplayLabel(button.title || '', button.url || '')}
                  </span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
