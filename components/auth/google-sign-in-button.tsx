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
  const next = searchParams.get('next') ?? '/';

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
