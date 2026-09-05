/* eslint-disable @next/next/no-img-element */
import './h3max-home.css';

import { Libre_Baskerville } from 'next/font/google';
import { Coins, Languages, Play, SlidersHorizontal } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import type {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';
import { Footer } from '@/themes/default/blocks/footer';
import { Header } from '@/themes/default/blocks/header';

import { GeneratorPanel } from './h3max-interactive';

const libre = Libre_Baskerville({
  weight: ['400'],
  style: ['italic'],
  subsets: ['latin'],
  variable: '--font-libre',
  display: 'swap',
});

const A = '/h3max';

const GALLERY: { label: string; src: string }[] = [
  { label: 'Dream sequence', src: `${A}/dream.webp` },
  { label: 'Octopus', src: `${A}/zhangyu.webp` },
  { label: 'Horse at speed', src: `${A}/hourse.webp` },
  { label: 'Car in motion', src: `${A}/car.webp` },
  { label: 'Robot in the rain', src: `${A}/seedance-robot.webp` },
  { label: 'Cinematic close-up', src: `${A}/minimax-dianying.webp` },
  { label: 'Cat, shallow depth', src: `${A}/minimax-cat.webp` },
  { label: 'Child at golden hour', src: `${A}/minimax-child.webp` },
  { label: 'Baseball swing', src: `${A}/minimax-bangqiu.webp` },
];
const CAPABILITIES: {
  tag: string;
  title: string;
  description: string;
  src: string;
}[] = [
  {
    tag: 'Live Direction',
    title: 'Change the story while it is playing',
    description:
      'Send a new prompt during the stream to introduce an action, reveal, location, or camera decision without restarting the experience.',
    src: `${A}/cap-directed-camera-motion.webp`,
  },
  {
    tag: 'Visual Anchor',
    title: 'Start from a first frame',
    description:
      'Use an optional image to establish the cast, setting, composition, and visual language before the live session begins.',
    src: `${A}/cap-first-last-frame.webp`,
  },
  {
    tag: 'Character Continuity',
    title: 'Keep the same cast on screen',
    description:
      'Preserve recognizable characters, relationships, wardrobe, and roles as prompts move the action forward.',
    src: `${A}/cap-consistent-characters.webp`,
  },
  {
    tag: 'Setting Memory',
    title: 'Return to a world that still feels familiar',
    description:
      'Maintain important locations, atmosphere, and scene details while the stream travels between story beats.',
    src: `${A}/cap-native-audio.webp`,
  },
  {
    tag: 'Story Continuity',
    title: 'Build on what already happened',
    description:
      'Carry established events and unresolved threads into the next prompt so each direction advances one continuous session.',
    src: `${A}/cap-art-direction.webp`,
  },
  {
    tag: 'Creative Control',
    title: 'Branch in realtime',
    description:
      'Guide comedy, drama, games, broadcasts, animation, or ambient worlds one decision at a time while watching the result unfold.',
    src: `${A}/cap-prompt-adherence.webp`,
  },
];

const FEATURES = [
  {
    icon: SlidersHorizontal,
    title: 'A focused session setup',
    description:
      'Choose resolution and aspect ratio, add an optional first frame, then describe the world you want to direct.',
  },
  {
    icon: Coins,
    title: 'Access follows your credit balance',
    description:
      'Sign in with Google and start directing when credits are available. If your balance is empty, top up from the pricing page.',
  },
  {
    icon: Languages,
    title: 'Direct through conversation',
    description:
      'Move into the existing chat workspace and shape the session with clear, natural-language directions.',
  },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: 'Can I try H3 Max Director for free?',
    answer:
      'You can create an account with Google at no cost. Starting a Director experience requires a positive credit balance; if your balance is empty, the app sends you to pricing.',
  },
  {
    question: 'How is Director different from a clip generator?',
    answer:
      'A clip generator turns one prompt into a fixed result. Director is built for a continuous realtime stream that you can steer with new prompts as the story unfolds.',
  },
  {
    question: 'Can I start with an image?',
    answer:
      'Yes. An optional first frame can establish the initial characters, setting, composition, and style for the session.',
  },
  {
    question: 'What does Director preserve?',
    answer:
      'It is designed to preserve characters, settings, and story continuity while accepting new live directions. Clear prompts still produce the strongest continuity.',
  },
  {
    question: 'Can I use the videos commercially?',
    answer:
      'Yes, subject to the applicable service terms. You are responsible for having the rights to anything you upload and for using the output lawfully.',
  },
];

const TABLE_ROWS: { label: string; direction: string; continuity: string }[] = [
  {
    label: 'Establish',
    direction: 'Describe the cast, world, tone, and opening situation',
    continuity: 'Characters, setting, and visual identity',
  },
  {
    label: 'Direct',
    direction: 'Send the next action, entrance, reveal, or camera cue',
    continuity: 'Relationships and prior story events',
  },
  {
    label: 'Branch',
    direction: 'Change the plan in response to what appears on screen',
    continuity: 'One evolving, coherent session',
  },
];
const mainWrap = 'mx-auto w-full max-w-6xl px-4 sm:px-6';

function Hero() {
  return (
    <section className="relative isolate flex min-h-[78vh] items-center overflow-hidden md:min-h-[88vh]">
      <video
        className="absolute inset-0 size-full object-cover"
        src={`${A}/seedance-shaqiu.mp4`}
        poster={`${A}/seedance-desert-warrior.webp`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label="Cinematic example for an H3 Max Director session"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <p className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
          Continuous video. Live creative control.
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-white md:text-6xl">
          Direct the story while it unfolds
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-white/80 md:text-lg">
          H3 Max Director creates a continuous realtime video stream you can
          steer with live prompts while preserving characters, settings, and
          story continuity from one moment to the next.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#generator"
            className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-transparent px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none"
          >
            Start directing
          </a>
          <Link
            href="/pricing"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-2.5 text-sm font-medium whitespace-nowrap text-white transition-all outline-none select-none hover:bg-white/20"
          >
            See pricing
          </Link>
        </div>
        <p className="mt-5 text-sm text-white/70">
          Sign in with Google to begin. A positive credit balance unlocks the
          Director experience.
        </p>
      </div>
    </section>
  );
}
function Generator() {
  return (
    <section id="generator" className={`${mainWrap} py-16`}>
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Set up your Director session
      </h2>
      <p className="text-muted-foreground mt-2 text-sm md:text-base">
        Establish the world, choose the frame, and enter the live chat
        experience to guide what happens next.
      </p>
      <GeneratorPanel />
    </section>
  );
}

function GalleryTile({ label, src }: { label: string; src: string }) {
  return (
    <figure className="group border-border bg-card relative overflow-hidden rounded-xl border">
      <a
        href="#generator"
        aria-label={`Play ${label}`}
        className="block aspect-video w-full overflow-hidden"
      >
        <img
          src={src}
          alt={label}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-full shadow-lg">
            <Play className="ml-0.5 size-5 fill-current" aria-hidden />
          </span>
        </span>
      </a>
    </figure>
  );
}

function Showcase() {
  return (
    <section className={`${mainWrap} pb-16`}>
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Worlds ready to be directed
      </h2>
      <p className="text-muted-foreground mt-2 text-sm md:text-base">
        Use these frames as inspiration for a character, setting, or opening
        beat.
      </p>
      <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {GALLERY.map((item) => (
          <GalleryTile key={item.label} label={item.label} src={item.src} />
        ))}
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className={`${mainWrap} pb-20`}>
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          One stream, many possible directions
        </h2>
        <p className="text-muted-foreground mt-3 text-sm leading-6 md:text-base">
          Start with a clear premise, then guide the action without giving up
          the people, places, and story already established.
        </p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {CAPABILITIES.map((cap) => (
          <article
            key={cap.title}
            className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
          >
            <a
              href="#generator"
              aria-label={`Play ${cap.title}`}
              className="group block aspect-video w-full overflow-hidden bg-black"
            >
              <img
                src={cap.src}
                alt={cap.title}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </a>
            <div className="p-5 sm:p-6">
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                {cap.tag}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                {cap.title}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                {cap.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function About() {
  return (
    <section className="border-border bg-secondary/30 border-y">
      <div className={`${mainWrap} py-16`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              What is H3 Max Director?
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              H3 Max Director is a realtime video model for interactive,
              continuous storytelling. Instead of ending after one fixed clip,
              the stream accepts new live prompts and carries established
              characters, settings, and story context into the next moment.
            </p>
          </div>
          <div className="border-border bg-card h-fit rounded-xl border p-5">
            <h3 className="text-sm font-semibold">
              H3 Max Director at a glance
            </h3>
            <dl className="mt-4">
              {[
                ['Experience', 'Continuous realtime stream'],
                ['Direction', 'Live natural-language prompts'],
                ['Visual input', 'Optional first frame'],
                ['Continuity', 'Characters, settings, and story'],
              ].map(([dt, dd]) => (
                <div
                  key={dt}
                  className="border-border flex items-baseline justify-between gap-4 border-b py-3 last:border-b-0"
                >
                  <dt className="text-muted-foreground text-sm">{dt}</dt>
                  <dd className="text-right text-sm font-medium">{dd}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
            Direct a session in three moves
          </h3>
          <p className="text-muted-foreground mt-3 max-w-3xl leading-relaxed">
            Give the model enough context to establish the world, then make each
            live direction specific enough to advance the action while
            preserving what matters.
          </p>
          <div className="border-border bg-card mt-6 overflow-hidden rounded-2xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-muted-foreground w-[24%] px-5 py-4 font-medium">
                      Stage
                    </th>
                    <th className="bg-primary/[0.04] w-[38%] px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">Your direction</span>
                      </div>
                    </th>
                    <th className="w-[38%] px-5 py-4 font-semibold">
                      Director maintains
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TABLE_ROWS.map((row) => (
                    <tr
                      key={row.label}
                      className="border-border border-b last:border-b-0"
                    >
                      <th className="text-muted-foreground px-5 py-4 text-left font-medium">
                        {row.label}
                      </th>
                      <td className="bg-primary/[0.04] px-5 py-4 font-medium">
                        {row.direction}
                      </td>
                      <td className="px-5 py-4">{row.continuity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-muted-foreground mt-5 text-xs">
            <span>H3 Max Director guide</span>
            <span aria-hidden>&middot;</span>
            <time dateTime="2026-09-05">Updated September 5, 2026</time>
          </p>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className={`${mainWrap} py-16`}>
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
        A simpler way to steer an evolving video
      </h2>
      <p className="text-muted-foreground mt-3 max-w-3xl leading-relaxed">
        Set the opening context here, pass the account and credit check, then
        continue directing in the existing chat workspace.
      </p>
      <div className="mt-9 grid gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title}>
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                <Icon className="size-4" aria-hidden />
              </span>
              <h3 className="mt-4 font-medium">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Questions about H3 Max Director
      </h2>
      <Accordion
        type="single"
        collapsible
        className="mt-8 flex w-full flex-col"
      >
        {FAQ.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger className="py-5 text-base font-medium hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 text-sm leading-6">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function Cta() {
  return (
    <section className={`${mainWrap} pb-20`}>
      <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl px-6 py-14 text-center md:px-12">
        <h2 className="text-2xl font-semibold text-balance md:text-4xl">
          Ready to direct what happens next?
        </h2>
        <p className="mt-3 text-sm opacity-90 md:text-base">
          Set the opening scene, sign in with Google, and enter the live
          experience.
        </p>
        <a
          href="#generator"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-7 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-transparent px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none"
        >
          Start directing
        </a>
      </div>
    </section>
  );
}

export default function H3MaxHome({
  header,
  footer,
}: {
  header: HeaderType;
  footer: FooterType;
}) {
  return (
    <div
      className={`h3max-scope ${libre.variable} bg-background text-foreground min-h-screen font-sans antialiased`}
    >
      <Header header={header} />

      <main>
        <Hero />
        <Generator />
        <Showcase />
        <Capabilities />
        <About />
        <Features />
        <Faq />
        <Cta />
      </main>
      <Footer footer={footer} />
    </div>
  );
}
