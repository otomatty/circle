'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ArrowLeft, MessageCircle, RefreshCw } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { logClientError, toAppError } from '~/lib/errors';

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  const { t } = useTranslation(['errors', 'common']);

  useEffect(() => {
    // エラーログを記録
    const appError = toAppError(error);
    logClientError(appError, {
      component: 'ErrorPage',
      metadata: {
        digest: error.digest,
      },
    });
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className={'flex h-screen flex-1 flex-col'}>
      <div
        className={
          'container m-auto flex w-full flex-1 flex-col items-center justify-center'
        }
      >
        <div className={'flex flex-col items-center space-y-8'}>
          <div>
            <h1 className={'font-heading text-9xl font-semibold'}>
              {t('errors.title')}
            </h1>
          </div>

          <div className={'flex flex-col items-center space-y-8'}>
            <div
              className={
                'flex max-w-xl flex-col items-center space-y-1 text-center'
              }
            >
              <div>
                <Heading level={2}>
                  {t('errors.errorOccurred')}
                </Heading>
              </div>

              <p className={'text-muted-foreground text-lg'}>
                {t('errors.errorOccurredDescription')}
              </p>

              {isDevelopment && error.message && (
                <div className={'mt-4 rounded-md bg-destructive/10 p-4 text-left'}>
                  <p className={'text-sm font-mono text-destructive'}>
                    {error.message}
                  </p>
                  {error.stack && (
                    <pre className={'mt-2 max-h-64 overflow-auto text-xs'}>
                      {error.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>

            <div className={'flex space-x-4'}>
              <Button className={'w-full'} variant={'default'} onClick={reset}>
                <ArrowLeft className={'mr-2 h-4'} />
                {t('errors.goBack')}
              </Button>

              <Button
                className={'w-full'}
                variant={'outline'}
                onClick={() => window.location.reload()}
              >
                <RefreshCw className={'mr-2 h-4'} />
                {t('errors.refresh')}
              </Button>

              <Button className={'w-full'} variant={'outline'} asChild>
                <Link href={'/contact'}>
                  <MessageCircle className={'mr-2 h-4'} />
                  {t('errors.contactSupport')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
