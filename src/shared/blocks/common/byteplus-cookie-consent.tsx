'use client';

import { useEffect, useState } from 'react';

const COOKIE_NAME = 'byteplus_cookie_consent';
const OPEN_SETTINGS_EVENT = 'byteplus:open-cookie-settings';

type ConsentMode = 'closed' | 'prompt' | 'settings';
type ConsentValue = 'all' | 'essential' | 'analytics' | 'marketing';

export function ByteplusCookieSettingsButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
    >
      Cookie Settings
    </button>
  );
}

export function ByteplusCookieConsent() {
  const [mode, setMode] = useState<ConsentMode>('closed');
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const consent = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${COOKIE_NAME}=`));

    if (!consent) setMode('prompt');

    const openSettings = () => setMode('settings');
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
  }, []);

  const persist = (value: ConsentValue) => {
    document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=15552000; SameSite=Lax`;
    window.setTimeout(() => window.location.reload(), 40);
  };

  const saveSettings = () => {
    if (analytics && marketing) persist('all');
    else if (analytics) persist('analytics');
    else if (marketing) persist('marketing');
    else persist('essential');
  };

  if (mode === 'closed') return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(8,12,20,0.24)] p-6 max-sm:p-0"
      role="presentation"
    >
      <section
        className="w-full max-w-[520px] rounded-2xl bg-white p-7 text-[#111] shadow-[0_24px_80px_rgba(0,0,0,0.24)] max-sm:max-h-[calc(100vh-58px)] max-sm:overflow-y-auto max-sm:rounded-b-none max-sm:px-6 max-sm:pt-[26px] max-sm:pb-[37px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="byteplus-cookie-title"
      >
        {mode === 'prompt' ? (
          <>
            <h2
              id="byteplus-cookie-title"
              className="m-0 max-w-[430px] text-xl leading-tight font-bold tracking-[-0.02em]"
            >
              Accept cookies from BytePlus on this browser?
            </h2>
            <p className="mt-3.5 text-[13px] leading-[1.55] text-[#3d434d] max-sm:text-[14.5px] max-sm:leading-[1.53]">
              We and our partners use cookies and similar technologies to
              operate, improve, protect, and analyze our websites. Essential
              cookies are required for the site to function properly. By
              clicking &quot;Accept All,&quot; you consent to us and our
              partners using optional cookies for purposes such as website usage
              analysis, personalized ads, and measuring BytePlus&apos; ad
              effectiveness. Clicking &quot;Reject All&quot; disables these
              optional cookies. Learn more in our{' '}
              <a
                className="text-[#2878ff]"
                href="https://www.byteplus.com/en/legal/cookie-policy"
              >
                Cookies Policy
              </a>
              . You can manage your cookie preferences by clicking on the
              &quot;Cookie Settings&quot; below.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-sm:mt-[31px] max-sm:grid-cols-1">
              <button
                type="button"
                className="min-h-11 rounded-full border-0 bg-[#0c0d0e] font-semibold text-white max-sm:min-h-[45px]"
                onClick={() => persist('all')}
              >
                Accept all
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full border-0 bg-[#0c0d0e] font-semibold text-white max-sm:min-h-[45px]"
                onClick={() => persist('essential')}
              >
                Reject all
              </button>
            </div>
            <button
              type="button"
              className="mx-auto mt-[18px] block border-0 bg-transparent font-semibold text-[#111] max-sm:mt-6"
              onClick={() => setMode('settings')}
            >
              Cookie Settings
            </button>
          </>
        ) : (
          <>
            <h2
              id="byteplus-cookie-title"
              className="m-0 text-xl leading-tight font-bold tracking-[-0.02em]"
            >
              Cookie Settings
            </h2>
            <p className="mt-3.5 text-[13px] leading-[1.55] text-[#3d434d]">
              Choose which optional cookies BytePlus may use on this browser.
            </p>
            <div className="mt-[22px] border-t border-[#e4e8ee]">
              <div className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[#e4e8ee] py-3">
                <span className="flex flex-col gap-1">
                  <strong className="text-[13px]">Essential cookies</strong>
                  <small className="text-[10px] text-[#707782]">
                    Required for security, sign-in, and core features.
                  </small>
                </span>
                <em className="text-[10px] text-[#1664ff] not-italic">
                  Always on
                </em>
              </div>
              {[
                {
                  title: 'Performance and analytics',
                  copy: 'Helps us understand and improve site performance.',
                  checked: analytics,
                  setChecked: setAnalytics,
                },
                {
                  title: 'Advertising and personalization',
                  copy: 'Supports relevant experiences and campaign measurement.',
                  checked: marketing,
                  setChecked: setMarketing,
                },
              ].map((item) => (
                <label
                  key={item.title}
                  className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[#e4e8ee] py-3"
                >
                  <span className="flex flex-col gap-1">
                    <strong className="text-[13px]">{item.title}</strong>
                    <small className="text-[10px] text-[#707782]">
                      {item.copy}
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    className="h-5 w-[38px] accent-[#1664ff]"
                    checked={item.checked}
                    onChange={(event) => item.setChecked(event.target.checked)}
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              className="mt-[22px] min-h-11 w-full rounded-full border-0 bg-[#0c0d0e] font-semibold text-white"
              onClick={saveSettings}
            >
              Save preferences
            </button>
          </>
        )}
      </section>
    </div>
  );
}
