import { Suspense } from 'react';

import { GoogleSignInButton } from '~/components/auth/google-sign-in-button';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

export async function generateMetadata() {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('auth:signIn'),
  };
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const i18n = await createI18nServerInstance();
  const params = await searchParams;
  const hasError = Boolean(params.error);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {i18n.t('auth:signInHeading')}
          </h1>
          <p className="text-sm text-muted-foreground">
            Google アカウントで Circle にログインします
          </p>
        </div>

        {hasError ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {i18n.t('auth:authenticationErrorAlertBody')}
          </p>
        ) : null}

        <Suspense fallback={<div className="h-10 w-full animate-pulse rounded-md bg-muted" />}>
          <GoogleSignInButton />
        </Suspense>
      </div>
    </div>
  );
}
