'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Heart, Play } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { useGatedCta } from '@/shared/hooks/use-gated-cta';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function TemplateGallery({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const { handleCtaClick } = useGatedCta();
  const groups = (section as any).groups || [];
  const chips = (section as any).chips || [];
  const [selectedGroup, setSelectedGroup] = useState<string>(
    groups[0]?.name || 'all'
  );
  const [selectedChip, setSelectedChip] = useState<string>(
    chips[0]?.name || 'all'
  );

  const filteredItems = useMemo(() => {
    return (section.items || []).filter((item: any) => {
      const groupMatch =
        selectedGroup === 'all' || !groups.length
          ? true
          : item.group === selectedGroup;
      const chipMatch =
        selectedChip === 'all' || !chips.length
          ? true
          : item.chips?.includes(selectedChip);
      return groupMatch && chipMatch;
    });
  }, [section.items, selectedGroup, selectedChip, groups.length, chips.length]);

  return (
    <section
      id={section.id}
      className={cn('py-10 sm:py-14', section.className, className)}
    >
      <div className="mx-auto max-w-[1630px] px-4 sm:px-8 lg:px-12">
        <div className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-[#15171f] sm:text-4xl">
              {section.title}
            </h2>
            {section.description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgba(20,22,31,.7)] sm:text-base">
                {section.description}
              </p>
            )}
          </div>
        </div>

        {groups.length > 0 && (
          <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto pb-1">
            {groups.map((group: any) => (
              <button
                key={group.name}
                type="button"
                onClick={() => setSelectedGroup(group.name)}
                className={cn(
                  'shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                  selectedGroup === group.name
                    ? 'bg-[#7657ff] text-white'
                    : 'bg-white text-[rgba(20,22,31,.7)] ring-1 ring-[rgba(24,22,31,.08)] hover:bg-[#f0f1f7]'
                )}
              >
                {group.title}
              </button>
            ))}
          </div>
        )}

        {chips.length > 0 && (
          <div className="scrollbar-hide mb-7 flex gap-2 overflow-x-auto pb-1">
            {chips.map((chip: any) => (
              <button
                key={chip.name}
                type="button"
                onClick={() => setSelectedChip(chip.name)}
                className={cn(
                  'shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors',
                  selectedChip === chip.name
                    ? 'bg-[#d8d2ff] text-[#5136c7]'
                    : 'bg-[#f0f1f7] text-[rgba(20,22,31,.7)] hover:bg-[#e7e8f1]'
                )}
              >
                {chip.title}
              </button>
            ))}
          </div>
        )}

        {filteredItems.length > 0 ? (
          <div className="columns-2 gap-3 sm:gap-4 lg:columns-3 xl:columns-4">
            {filteredItems.map((item: any, index: number) => (
              <Link
                key={item.title || index}
                href={item.url || '/chat'}
                className="group relative mb-3 block overflow-hidden rounded-2xl border border-[rgba(24,22,31,.08)] bg-[#f0f1f7] sm:mb-4"
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
                    width={item.image.width || 832}
                    height={item.image.height || 1248}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                {item.badge && (
                  <span className="absolute top-2.5 left-2.5 rounded-lg bg-black/35 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
                    {item.badge}
                  </span>
                )}
                <span className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-xl bg-white/18 text-white backdrop-blur">
                  <Play className="size-4 fill-current" />
                </span>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-4">
                  <div className="min-w-0">
                    <h3 className="font-display truncate text-xs font-semibold text-white sm:text-sm">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-0.5 truncate text-xs text-white/70">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.likes && (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-white/90">
                      <Heart className="size-3.5 fill-current" />
                      {item.likes}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[rgba(24,22,31,.12)] bg-white py-20 text-center text-[rgba(20,22,31,.45)]">
            No templates found
          </div>
        )}
      </div>
    </section>
  );
}
