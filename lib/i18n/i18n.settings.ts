/**
 * i18n.settings.ts
 *
 * このファイルは、アプリケーション固有のi18n設定を管理します。
 * 主な役割：
 * 1. デフォルト言語の設定
 * 2. サポートする言語リストの管理
 * 3. 翻訳名前空間の定義
 * 4. 言語設定のクッキー管理
 */

import { createI18nSettings } from '@kit/i18n';

/**
 * アプリケーションのデフォルト言語
 * 環境変数から設定可能で、未設定の場合は'en'を使用
 */
export const defaultLanguage = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en';

/**
 * アプリケーションがサポートする言語のリスト
 * 新しい言語のサポートを追加する場合はここに追加
 */
export const languages = ['en', 'ja'] as const;
export type SupportedLanguage = (typeof languages)[number];

/**
 * 各言語の表示名
 */
export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ja: '日本語',
} as const;

/**
 * 選択された言語を保存するクッキーの名前
 * ユーザーの言語設定を永続化するために使用
 */
export const I18N_COOKIE_NAME = 'lang';

/**
 * アプリケーションで使用する翻訳名前空間のリスト
 * 機能ごとに分割された翻訳カテゴリーを定義
 *
 * 名前空間の説明：
 * - common: 共通で使用する翻訳
 * - auth: 認証関連の翻訳
 * - account: アカウント設定関連の翻訳
 * - teams: チーム機能関連の翻訳
 * - billing: 課金関連の翻訳
 * - marketing: マーケティングページの翻訳
 */
export const defaultI18nNamespaces = [
  'common',
  'auth',
  'account',
  'teams',
  'billing',
  'marketing',
];

export type TranslationNamespace = (typeof defaultI18nNamespaces)[number];

/**
 * 指定された言語と名前空間に基づいてi18n設定を生成
 *
 * @param language - 使用する言語。未指定の場合はデフォルト言語を使用
 * @param ns - 使用する名前空間。未指定の場合はデフォルトの名前空間を使用
 * @returns i18next用の設定オブジェクト
 */
export function getI18nSettings(
  language: string | undefined,
  ns: string | string[] = defaultI18nNamespaces
) {
  let lng = language ?? defaultLanguage;

  // 指定された言語がサポートされていない場合はデフォルト言語にフォールバック
  if (!languages.includes(lng as SupportedLanguage)) {
    console.warn(
      `Language "${lng}" is not supported. Falling back to "${defaultLanguage}"`
    );

    lng = defaultLanguage;
  }

  return createI18nSettings({
    language: lng,
    namespaces: ns,
    languages: Array.from(languages),
  });
}
