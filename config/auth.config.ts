/**
 * 認証設定ファイル
 *
 * このファイルはアプリケーションの認証機能に関する設定を管理します。
 * Supabaseを使用した認証方法（パスワード認証、マジックリンク、OAuth）の
 * 有効/無効の設定や、reCAPTCHA、利用規約の表示設定などを含みます。
 */

import type { Provider } from '@supabase/supabase-js';

import { z } from 'zod';

/**
 * 利用可能なOAuthプロバイダーの一覧を取得する関数
 * Supabaseがサポートする全てのOAuthプロバイダーをZodのenum型として定義
 */
const providers: z.ZodType<Provider> = getProviders();

/**
 * 認証設定のスキーマ定義
 * Zodを使用して型安全な設定オブジェクトを定義
 */
const AuthConfigSchema = z.object({
  captchaTokenSiteKey: z
    .string({
      description: 'reCAPTCHAのサイトキー。',
    })
    .optional(),
  displayTermsCheckbox: z
    .boolean({
      description:
        'サインアップ時に利用規約の同意チェックボックスを表示するかどうか。',
    })
    .optional(),
  providers: z.object({
    password: z.boolean({
      description: 'パスワード認証を有効にするかどうか。',
    }),
    magicLink: z.boolean({
      description:
        'マジックリンク認証（メールリンク認証）を有効にするかどうか。',
    }),
    oAuth: providers.array(),
  }),
});

/**
 * 環境変数から認証設定を読み込み、スキーマに基づいて検証
 */
const authConfig = AuthConfigSchema.parse({
  // 注意: これは公開キーなので、公開しても安全です。
  // Supabaseダッシュボードから値をコピーしてください。
  captchaTokenSiteKey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,

  // サインアップ時に利用規約の同意チェックボックスを表示するかどうか
  displayTermsCheckbox:
    process.env.NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX === 'true',

  // 注意: 本番環境では、以下のプロバイダーをSupabaseコンソールで有効にしてください
  providers: {
    password: process.env.NEXT_PUBLIC_AUTH_PASSWORD === 'true',
    magicLink: process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK === 'true',
    oAuth: ['google', 'github'], // 有効なOAuthプロバイダーの配列
  },
} satisfies z.infer<typeof AuthConfigSchema>);

export default authConfig;

/**
 * Supabaseがサポートする全てのOAuthプロバイダーを定義する関数
 *
 * @returns Zodのenum型として定義されたプロバイダーリスト
 */
function getProviders() {
  return z.enum([
    'apple', // Apple
    'azure', // Microsoft Azure
    'bitbucket', // Bitbucket
    'discord', // Discord
    'facebook', // Facebook
    'figma', // Figma
    'github', // GitHub
    'gitlab', // GitLab
    'google', // Google
    'kakao', // Kakao
    'keycloak', // Keycloak
    'linkedin', // LinkedIn
    'linkedin_oidc', // LinkedIn OIDC
    'notion', // Notion
    'slack', // Slack
    'spotify', // Spotify
    'twitch', // Twitch
    'twitter', // Twitter
    'workos', // WorkOS
    'zoom', // Zoom
    'fly', // Fly.io
  ]);
}
