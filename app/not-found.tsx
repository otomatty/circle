import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';

import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const title = 'ページが見つかりません';

  return {
    title,
  };
};

const NotFoundPage = async () => {
  const client = getSupabaseServerClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  return (
    <div className={'flex h-screen flex-1 flex-col'}>
      <div
        className={
          'container m-auto flex w-full flex-1 flex-col items-center justify-center'
        }
      >
        <div className={'flex flex-col items-center space-y-12'}>
          <div>
            <h1 className={'font-heading text-8xl font-extrabold xl:text-9xl'}>
              404
            </h1>
          </div>

          <div className={'flex flex-col items-center space-y-8'}>
            <div className={'flex flex-col items-center space-y-2.5'}>
              <div>
                <Heading level={1}>ページが見つかりません</Heading>
              </div>

              <p className={'text-muted-foreground'}>
                お探しのページは存在しないか、移動した可能性があります。
              </p>
            </div>

            <Button asChild variant={'outline'}>
              <Link href={'/'}>
                <ArrowLeft className={'mr-2 h-4'} />
                ホームに戻る
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withI18n(NotFoundPage);
