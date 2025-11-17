import Link from 'next/link';

import type { AuthError } from '@supabase/supabase-js';

import { ResendAuthLinkForm } from '@kit/auth/resend-email-link';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';

import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

interface AuthCallbackErrorPageProps {
  searchParams: Promise<{
    error: string;
    callback?: string;
    email?: string;
    code?: AuthError['code'];
  }>;
}

async function AuthCallbackErrorPage(props: AuthCallbackErrorPageProps) {
  const { error, callback, code } = await props.searchParams;
  const signInPath = pathsConfig.auth.signIn;
  const redirectPath = callback ?? pathsConfig.auth.callback;

  return (
    <div className={'flex flex-col space-y-4 py-4'}>
      <Alert variant={'destructive'}>
        <AlertTitle>認証エラー</AlertTitle>

        <AlertDescription>
          申し訳ありません。認証中にエラーが発生しました。もう一度お試しください。
          {error && (
            <div className="mt-2 text-sm text-red-600">エラー: {error}</div>
          )}
          {code && (
            <div className="mt-1 text-xs text-gray-500">コード: {code}</div>
          )}
        </AlertDescription>
      </Alert>

      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          以下の対処法をお試しください：
        </div>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>ブラウザのキャッシュとCookieをクリアしてから再試行</li>
          <li>別のブラウザで試す</li>
          <li>プライベートウィンドウ（シークレットモード）で試す</li>
          {code === 'bad_code_verifier' && (
            <li>Googleアカウントからログアウトして再度試す</li>
          )}
        </ul>
      </div>

      <AuthCallbackForm
        code={code}
        signInPath={signInPath}
        redirectPath={redirectPath}
      />
    </div>
  );
}

function AuthCallbackForm(props: {
  signInPath: string;
  redirectPath?: string;
  code?: AuthError['code'];
}) {
  switch (props.code) {
    case 'otp_expired':
      return <ResendAuthLinkForm redirectPath={props.redirectPath} />;
    case 'bad_code_verifier':
      return (
        <div className="space-y-4">
          <Button className={'w-full'} asChild>
            <Link href={props.signInPath}>ログインページに戻る</Link>
          </Button>
        </div>
      );
    default:
      return <SignInButton signInPath={props.signInPath} />;
  }
}

function SignInButton({ signInPath }: { signInPath: string }) {
  return (
    <div className="space-y-4">
      <Button className={'w-full'} asChild>
        <Link href={signInPath}>ログインページに戻る</Link>
      </Button>
    </div>
  );
}

export default withI18n(AuthCallbackErrorPage);
