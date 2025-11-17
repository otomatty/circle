'use client';

import type { Provider } from '@supabase/supabase-js';

import { AuthLayoutShell } from '@kit/auth/shared';
import { SignInMethodsContainer } from '@kit/auth/sign-in';

// 必要ならロゴをインポートして <AuthLayoutShell Logo={YourLogo}> のように渡す
// import { YourLogo } from '@/components/logo';

export default function SignInPage() {
  // 有効にする OAuth プロバイダーを設定。必要に応じて変更して。
  const oauthProviders: Provider[] = ['google', 'github'];

  return (
    <SignInMethodsContainer
      providers={{
        password: true, // パスワード認証
        magicLink: true, // マジックリンク認証
        oAuth: oauthProviders, // OAuth認証
      }}
      paths={{
        callback: '/auth/callback', // Supabase Auth Callback URL
        home: '/[orgId]/team/CORE/all', // 認証後のリダイレクト先
      }}
      // onSignInSuccess は指定しない（デフォルトのリダイレクトを使う）
    />
  );
}
