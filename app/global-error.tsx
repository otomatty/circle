'use client';

import Link from 'next/link';

import { ArrowLeft, MessageCircle } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';

const GlobalErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  console.error(error);

  return (
    <html lang="ja">
      <body>
        <div className={'flex h-screen flex-1 flex-col'}>
          <div
            className={
              'container m-auto flex w-full flex-1 flex-col items-center justify-center'
            }
          >
            <div className={'flex flex-col items-center space-y-8'}>
              <div>
                <h1 className={'font-heading text-9xl font-semibold'}>
                  エラー
                </h1>
              </div>

              <div className={'flex flex-col items-center space-y-8'}>
                <div
                  className={
                    'flex max-w-xl flex-col items-center space-y-1 text-center'
                  }
                >
                  <div>
                    <Heading level={2}>予期せぬエラーが発生しました</Heading>
                  </div>

                  <p className={'text-muted-foreground text-lg'}>
                    申し訳ありません。問題が発生しました。もう一度お試しください。
                  </p>
                </div>

                <div>
                  <Button
                    className={'w-full'}
                    variant={'default'}
                    onClick={reset}
                  >
                    <ArrowLeft className={'mr-2 h-4'} />
                    前のページに戻る
                  </Button>

                  <Button className={'w-full'} variant={'outline'} asChild>
                    <Link href={'/contact'}>
                      <MessageCircle className={'mr-2 h-4'} />
                      お問い合わせ
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalErrorPage;
