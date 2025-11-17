/**
 * アプリケーション基本設定ファイル
 *
 * このファイルはアプリケーション全体の基本設定を管理します。
 * サイト名、タイトル、説明、URL、ロケール、テーマなどの
 * 基本的な設定を一元管理し、アプリケーション全体で参照できるようにします。
 */

import { z } from 'zod';

// 本番環境かどうかを判定
const production = process.env.NODE_ENV === 'production';

/**
 * アプリケーション設定のスキーマ定義
 * Zodを使用して型安全な設定オブジェクトを定義
 */
const AppConfigSchema = z
  .object({
    name: z
      .string({
        description: 'SaaSの名前。例: "Makerkit"',
        required_error: '環境変数 NEXT_PUBLIC_PRODUCT_NAME を設定してください',
      })
      .min(1),
    title: z
      .string({
        description: 'SaaSのデフォルトのtitleタグ。',
        required_error: '環境変数 NEXT_PUBLIC_SITE_TITLE を設定してください',
      })
      .min(1),
    description: z.string({
      description: 'SaaSのデフォルトの説明。',
      required_error:
        '環境変数 NEXT_PUBLIC_SITE_DESCRIPTION を設定してください',
    }),
    url: z
      .string({
        required_error: '環境変数 NEXT_PUBLIC_SITE_URL を設定してください',
      })
      .url({
        message: `本番ビルドをデプロイしようとしていますが、NEXT_PUBLIC_SITE_URL変数にhttpsではなくhttpを使用したURLが設定されています。これは誤った設定である可能性が高いため、ビルドを中止します。有効なURLを環境変数NEXT_PUBLIC_SITE_URLに設定してください。例: 'https://example.com'`,
      }),
    locale: z
      .string({
        description: 'SaaSのデフォルトのロケール。',
        required_error:
          '環境変数 NEXT_PUBLIC_DEFAULT_LOCALE を設定してください',
      })
      .default('en'),
    theme: z.enum(['light', 'dark', 'system']),
    production: z.boolean(),
    themeColor: z.string(),
    themeColorDark: z.string(),
  })
  // 本番環境ではHTTPSのURLのみを許可する検証
  .refine(
    (schema) => {
      const isCI = process.env.NEXT_PUBLIC_CI;

      if (isCI ?? !schema.production) {
        return true;
      }

      return !schema.url.startsWith('http:');
    },
    {
      message: `有効なHTTPS URLを設定してください。環境変数NEXT_PUBLIC_SITE_URLに有効なURLを設定してください。例: 'https://example.com'`,
      path: ['url'],
    }
  )
  // ライトテーマとダークテーマの色が異なることを検証
  .refine(
    (schema) => {
      return schema.themeColor !== schema.themeColorDark;
    },
    {
      message: 'ライトテーマとダークテーマで異なる色を設定してください。',
      path: ['themeColor'],
    }
  );

/**
 * 環境変数からアプリケーション設定を読み込み、スキーマに基づいて検証
 */
const appConfig = AppConfigSchema.parse({
  name: process.env.NEXT_PUBLIC_PRODUCT_NAME,
  title: process.env.NEXT_PUBLIC_SITE_TITLE,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  url: process.env.NEXT_PUBLIC_SITE_URL,
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  theme: process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE,
  themeColor: process.env.NEXT_PUBLIC_THEME_COLOR,
  themeColorDark: process.env.NEXT_PUBLIC_THEME_COLOR_DARK,
  production,
});

export default appConfig;
