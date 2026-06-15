'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { authClient } from '~/lib/auth-client';
import { Button } from '~/components/ui/button';

export function GoogleSignInButton() {
  const { t } = useTranslation('auth');
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const rawNext = searchParams.get('next') ?? '/';
  // Only allow internal, single-slash paths to avoid open redirects.
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  return (
    <Button
      type="button"
      className="w-full"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await authClient.signIn.social({
            provider: 'google',
            callbackURL: next,
          });
        });
      }}
    >
      {isPending ? '...' : t('signInWithGoogle')}
    </Button>
  );
}
