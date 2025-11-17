/**
 * 機能フラグ設定ファイル
 *
 * このファイルはアプリケーションの機能フラグ（Feature Flags）を管理します。
 * 機能フラグを使用することで、特定の機能を動的に有効/無効にしたり、
 * A/Bテストを実施したり、段階的なリリースを行うことができます。
 */

import { z } from 'zod';

/**
 * 言語優先度の型定義
 * - 'user': ユーザーの設定言語を優先
 * - 'application': アプリケーションのデフォルト言語を優先
 */
type LanguagePriority = 'user' | 'application';

/**
 * 機能フラグのスキーマ定義
 * Zodを使用して型安全な設定オブジェクトを定義
 */
const FeatureFlagsSchema = z.object({
  enableThemeToggle: z.boolean({
    description:
      'ユーザーインターフェースでテーマ切り替えを有効にするかどうか。',
    required_error:
      '環境変数 NEXT_PUBLIC_ENABLE_THEME_TOGGLE を設定してください',
  }),
  languagePriority: z
    .enum(['user', 'application'], {
      required_error:
        '環境変数 NEXT_PUBLIC_LANGUAGE_PRIORITY を設定してください',
      description: `'user'に設定すると、ユーザーの優先言語を使用します。'application'に設定すると、アプリケーションのデフォルト言語を使用します。`,
    })
    .default('application'),
  enableVersionUpdater: z.boolean({
    description: 'バージョン更新通知機能を有効にするかどうか。',
    required_error:
      '環境変数 NEXT_PUBLIC_ENABLE_VERSION_UPDATER を設定してください',
  }),
});

/**
 * 環境変数から機能フラグ設定を読み込み、スキーマに基づいて検証
 */
const featuresFlagConfig = FeatureFlagsSchema.parse({
  enableThemeToggle: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_THEME_TOGGLE,
    true // デフォルトでテーマ切り替えを有効化
  ),
  languagePriority: process.env
    .NEXT_PUBLIC_LANGUAGE_PRIORITY as LanguagePriority,
  enableVersionUpdater: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_VERSION_UPDATER,
    false // デフォルトでバージョン更新通知を無効化
  ),
} satisfies z.infer<typeof FeatureFlagsSchema>);

export default featuresFlagConfig;

/**
 * 文字列値をブール値に変換するユーティリティ関数
 *
 * @param value - 変換する値（通常は環境変数から取得した文字列）
 * @param defaultValue - 変換できない場合のデフォルト値
 * @returns ブール値
 */
function getBoolean(value: unknown, defaultValue: boolean) {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return defaultValue;
}
