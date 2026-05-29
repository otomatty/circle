'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { signInWithGoogle } from '~/actions/auth';
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
          await signInWithGoogle(next);
        });
      }}
    >
      {isPending ? '...' : t('signInWithGoogle')}
    </Button>
  );
}
