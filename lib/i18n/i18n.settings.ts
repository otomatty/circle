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

/**
 * アプリケーションのデフォルト言語
 * 環境変数から設定可能で、未設定の場合は'ja'を使用
 */
export const defaultLanguage = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'ja';

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
  'errors',
];

export type TranslationNamespace = (typeof defaultI18nNamespaces)[number];

/**
 * i18next設定オブジェクトの型
 */
export interface I18nSettings {
  lng: string;
  fallbackLng: string;
  ns: string | string[];
  defaultNS: string;
  fallbackNS: string | string[];
  supportedLngs: readonly string[];
  load: 'languageOnly' | 'currentOnly' | 'all';
  preload: readonly string[];
  debug: boolean;
  interpolation: {
    escapeValue: boolean;
  };
  react: {
    useSuspense: boolean;
    bindI18n: string;
    bindI18nStore: string;
    transEmptyNodeValue: string;
    transSupportBasicHtmlNodes: boolean;
    transKeepBasicHtmlNodesFor: string[];
  };
  returnNull: boolean;
  returnEmptyString: boolean;
  returnObjects: boolean;
  saveMissing: boolean;
  missingKeyHandler?: (lng: string, ns: string, key: string) => void;
}

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
): I18nSettings {
  let lng = language ?? defaultLanguage;

  // 指定された言語がサポートされていない場合はデフォルト言語にフォールバック
  if (!languages.includes(lng as SupportedLanguage)) {
    console.warn(
      `Language "${lng}" is not supported. Falling back to "${defaultLanguage}"`
    );

    lng = defaultLanguage;
  }

  const namespaces = Array.isArray(ns) ? ns : [ns];
  const defaultNS = namespaces[0] || 'common';

  return {
    lng,
    fallbackLng: defaultLanguage,
    ns: namespaces,
    defaultNS,
    fallbackNS: namespaces,
    supportedLngs: Array.from(languages),
    load: 'all',
    preload: Array.from(languages),
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span'],
    },
    returnNull: false,
    returnEmptyString: false,
    returnObjects: true,
    saveMissing: true,
    missingKeyHandler: (lng: string, ns: string, key: string) => {
      console.warn(
        `Missing translation key: ${key} in namespace: ${ns} for language: ${lng}`
      );
    },
  };
}
