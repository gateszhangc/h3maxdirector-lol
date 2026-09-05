'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { useAppContext } from '@/shared/contexts/app';

type CtaIntent = 'create' | 'sign-in' | 'pricing' | 'external';

function getCtaIntent(url?: string | null): CtaIntent {
  if (!url) {
    return 'external';
  }

  if (url === '/pricing' || url.startsWith('/pricing?')) {
    return 'pricing';
  }

  if (url === '/sign-in' || url.startsWith('/sign-in?')) {
    return 'sign-in';
  }

  if (url.startsWith('/')) {
    return 'create';
  }

  return 'external';
}

export function useGatedCta() {
  const router = useRouter();
  const t = useTranslations('common.sign');
  const { user, isCheckSign, setIsShowSignModal, setSignCallbackUrl } =
    useAppContext();
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);

  const getDisplayLabel = useCallback(
    (label: string, url?: string | null) => {
      const intent = getCtaIntent(url);

      if (
        isCheckSign ||
        user ||
        intent === 'sign-in' ||
        intent === 'pricing' ||
        intent === 'external'
      ) {
        return label;
      }

      return t('home_cta_sign_in_to', { label });
    },
    [isCheckSign, user, t]
  );

  const handleCtaClick = useCallback(
    async (url?: string | null) => {
      const intent = getCtaIntent(url);

      if (isCheckSign || isCheckingCredits) {
        return;
      }

      if (intent === 'pricing') {
        router.push('/pricing');
        return;
      }

      if (intent === 'external') {
        if (url?.startsWith('http')) {
          window.location.href = url;
        }
        return;
      }

      if (!user) {
        setSignCallbackUrl('/');
        setIsShowSignModal(true);
        return;
      }

      if (intent === 'sign-in') {
        router.push('/');
        return;
      }

      setIsCheckingCredits(true);
      try {
        const response = await fetch('/api/user/get-user-credits', {
          method: 'POST',
        });
        const result = await response.json();

        if (!response.ok || result.code !== 0) {
          if (/auth|sign in/i.test(result.message || '')) {
            setSignCallbackUrl('/');
            setIsShowSignModal(true);
            return;
          }
          throw new Error(
            result.message || 'Unable to check your credit balance'
          );
        }

        const remainingCredits = Number(result.data?.remainingCredits || 0);
        router.push(remainingCredits > 0 ? '/chat' : '/pricing');
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Unable to check your credit balance. Please try again.'
        );
      } finally {
        setIsCheckingCredits(false);
      }
    },
    [
      isCheckingCredits,
      isCheckSign,
      router,
      setIsShowSignModal,
      setSignCallbackUrl,
      user,
    ]
  );

  return { getDisplayLabel, handleCtaClick, isCheckingCredits };
}

export { getCtaIntent };
