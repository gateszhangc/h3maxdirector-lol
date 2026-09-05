'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';

import { useAppContext } from '@/shared/contexts/app';
import { useGatedCta } from '@/shared/hooks/use-gated-cta';

const selectCls =
  'flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-input/30 py-2 pr-2 pl-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm leading-snug font-medium select-none"
    >
      {children}
    </label>
  );
}

function UploadCard({
  id,
  hint,
  onFile,
}: {
  id: string;
  hint: string;
  onFile: (name: string | null) => void;
}) {
  const [name, setName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id}>First frame (optional)</FieldLabel>
      <button
        id={id}
        type="button"
        onClick={() => inputRef.current?.click()}
        className="border-border text-muted-foreground hover:text-foreground hover:border-primary/60 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm transition-colors"
      >
        <ImagePlus className="size-5" aria-hidden />
        <span className="text-center">
          {name ? name : 'Click to upload or drop an image'}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setName(file.name);
            onFile(file.name);
          }
        }}
      />
      <p className="text-muted-foreground text-xs">{hint}</p>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-input bg-input/30 px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

export function GeneratorPanel() {
  const [resolution, setResolution] = useState('768p');
  const [aspect, setAspect] = useState('16:9');
  const [prompt, setPrompt] = useState('');
  const [firstFrameName, setFirstFrameName] = useState<string | null>(null);

  void prompt;
  void firstFrameName;

  const { user, isCheckSign } = useAppContext();
  const { handleCtaClick, isCheckingCredits } = useGatedCta();
  const isChecking = isCheckSign;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="border-border bg-card rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Input</h3>
        </div>
        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <FieldLabel htmlFor="model">Experience</FieldLabel>
            <select
              id="model"
              defaultValue="H3 Max Director"
              className={selectCls}
              aria-label="Model"
            >
              <option value="H3 Max Director">H3 Max Director</option>
            </select>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="prompt">Opening direction</FieldLabel>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A continuous mystery set in a rain-soaked city. Preserve the detective, the hotel, and every clue as new directions arrive."
              className={`${inputCls} field-sizing-content min-h-16`}
            />
          </div>

          <UploadCard
            id="first-frame"
            hint="Use an image to establish the cast, setting, and opening composition."
            onFile={setFirstFrameName}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="resolution">Resolution</FieldLabel>
              <select
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className={selectCls}
              >
                <option value="480p">480p</option>
                <option value="768p">768p</option>
              </select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="ratio">Aspect ratio</FieldLabel>
              <select
                id="ratio"
                value={aspect}
                onChange={(e) => setAspect(e.target.value)}
                className={selectCls}
              >
                <option value="16:9">16:9</option>
                <option value="1:1">1:1</option>
                <option value="9:16">9:16</option>
              </select>
            </div>
          </div>

          <div className="border-border mt-6 border-t pt-5">
            <p className="text-muted-foreground text-xs">
              Your balance is checked securely before the Director workspace
              opens.
            </p>
            {isChecking || isCheckingCredits ? (
              <button
                type="button"
                disabled
                className="bg-primary text-primary-foreground mt-4 inline-flex h-9 w-full shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-transparent px-2.5 text-sm font-medium whitespace-nowrap opacity-70 transition-all outline-none select-none"
              >
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Checking…
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleCtaClick('/chat')}
                className="bg-primary text-primary-foreground hover:bg-primary/80 focus-visible:ring-ring/50 mt-4 inline-flex h-9 w-full shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3"
              >
                {user ? 'Start directing' : 'Sign in to start'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-border bg-card rounded-xl border p-5">
        <h3 className="font-semibold">Live session</h3>
        <div className="border-border bg-muted/40 mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-lg border">
          <p className="text-muted-foreground px-6 text-center text-sm">
            Your continuous video stream will appear in the Director workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
