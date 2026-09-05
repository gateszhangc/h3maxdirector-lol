'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronDown,
  Clapperboard,
  ImagePlus,
  Layers3,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { useGatedCta } from '@/shared/hooks/use-gated-cta';
import { cn } from '@/shared/lib/utils';
import {
  Button as ButtonType,
  Image as ImageType,
} from '@/shared/types/blocks/common';
import { Section } from '@/shared/types/blocks/landing';

type CreatorParam = {
  label: string;
  value?: string;
};

type CreatorHeroSection = Section & {
  prompt_placeholder?: string;
  reference_hint?: string;
  reference_images?: ImageType[];
  params?: CreatorParam[];
  primary_button?: ButtonType;
};

const creationModes = [
  { label: 'Text to video', icon: WandSparkles },
  { label: 'Image to video', icon: ImagePlus },
  { label: 'All reference', icon: Layers3 },
];

export function CreatorHero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const config = section as CreatorHeroSection;
  const { getDisplayLabel, handleCtaClick } = useGatedCta();
  const [prompt, setPrompt] = useState('');
  const [activeMode, setActiveMode] = useState(0);
  const primaryButton = config.primary_button;
  const referenceImages = config.reference_images || [];
  const params = config.params || [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleCtaClick(primaryButton?.url || '/chat');
  };

  return (
    <section
      id={section.id}
      className={cn(
        'relative overflow-hidden pt-20 pb-7 sm:pt-10 sm:pb-8',
        section.className,
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1630px] px-4 sm:px-8 lg:px-12">
        <div
          role="tablist"
          aria-label="Creation mode"
          className="grid grid-cols-3 gap-2 sm:gap-5"
        >
          {creationModes.map((mode, index) => {
            const Icon = mode.icon;
            const active = activeMode === index;
            return (
              <button
                key={mode.label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveMode(index)}
                className={cn(
                  'font-display group relative flex h-14 min-w-0 items-center justify-between overflow-hidden rounded-2xl px-2.5 text-left text-[10px] font-semibold tracking-[0.01em] transition duration-300 sm:px-7 sm:text-sm sm:tracking-[0.02em]',
                  active
                    ? 'bg-[#7657ff] text-white shadow-[0_12px_30px_rgba(118,87,255,.22)]'
                    : 'bg-[#f0f1f7] text-[#15171f] hover:bg-[#e8e9f2]'
                )}
              >
                <span className="relative z-10 flex min-w-0 items-center gap-1.5 sm:gap-2.5">
                  <Icon className="size-4 shrink-0 sm:size-4.5" />
                  <span className="leading-tight">{mode.label}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'absolute -right-4 -bottom-8 size-24 rounded-full transition duration-500 group-hover:scale-110',
                    active ? 'bg-white/12' : 'bg-[#d8d2ff]/70'
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10">
          <div className="font-display text-[clamp(2.15rem,5vw,4.3rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-[#15171f]">
            <span className="block">H3 is live.</span>
            <span className="mt-1 block text-[#7657ff]">
              Turn inspiration into film.
            </span>
          </div>
          {section.description && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(20,22,31,.7)] sm:text-lg">
              {section.description}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 overflow-hidden rounded-[24px] border border-[rgba(24,22,31,.12)] bg-white shadow-[0_18px_52px_rgba(34,32,46,.08)] sm:mt-7"
        >
          <div className="flex min-h-48 flex-col p-4 sm:min-h-56 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="font-display flex items-center gap-2 text-sm font-semibold text-[#15171f]">
                <Sparkles className="size-4 text-[#7657ff]" />
                {creationModes[activeMode].label}
              </div>
              <span className="rounded-xl bg-[#f0f1f7] px-3 py-1.5 text-xs font-medium text-[rgba(20,22,31,.7)]">
                {config.reference_hint || 'Reference (0/4)'}
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={
                config.prompt_placeholder ||
                'Describe the video you want to create…'
              }
              rows={4}
              className="mt-5 min-h-24 w-full flex-1 resize-none border-0 bg-transparent text-base leading-7 text-[#15171f] outline-none placeholder:text-[rgba(18,20,31,.35)] focus:ring-0 sm:text-lg"
            />

            <div className="mt-5 flex flex-col gap-4 border-t border-[rgba(24,22,31,.08)] pt-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <div className="mr-1 flex -space-x-2">
                  {referenceImages.slice(0, 4).map((image, index) => (
                    <div
                      key={image.src || index}
                      className="relative size-9 overflow-hidden rounded-xl border-2 border-white bg-[#f0f1f7] shadow-xs"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt || ''}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                {params.map((param) => (
                  <button
                    key={`${param.label}-${param.value}`}
                    type="button"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#f0f1f7] px-3 text-xs font-medium text-[#15171f] transition hover:bg-[#e7e8f1]"
                  >
                    <span>{param.value || param.label}</span>
                    <ChevronDown className="size-3.5 text-[rgba(20,22,31,.45)]" />
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 shrink-0 rounded-xl bg-[#7657ff] px-5 font-semibold text-white shadow-none hover:bg-[#6849ed]"
              >
                <Clapperboard className="size-4" />
                {getDisplayLabel(
                  primaryButton?.title || 'Start creating',
                  primaryButton?.url || '/chat'
                )}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
