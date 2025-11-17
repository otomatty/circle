/**
 * i18n.server.ts
 *
 * このファイルは、サーバーサイドでのi18n機能の初期化と言語検出を担当します。
 * 主な役割：
 * 1. サーバーサイドでのi18nインスタンスの作成
 * 2. ユーザーの言語設定の検出と適用
 * 3. 言語優先順位の管理
 */

/**
 * i18n.server.ts
 *
 * このファイルは、サーバーサイドでのi18n機能の初期化と言語検出を担当します。
 * 主な役割：
 * 1. サーバーサイドでのi18nインスタンスの作成
 * 2. ユーザーの言語設定の検出と適用
 * 3. 言語優先順位の管理
 */

import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { resolve } from 'path';
import { existsSync } from 'fs';

import featuresFlagConfig from '~/config/feature-flags.config';
import {
  I18N_COOKIE_NAME,
  getI18nSettings,
  languages,
  type SupportedLanguage,
  defaultLanguage,
} from '~/lib/i18n/i18n.settings';

import { i18nResolver } from './i18n.resolver';

/**
 * 言語優先順位の設定
 * feature flagsで'user'に設定されている場合、ブラウザの設定を優先
 */
const priority = featuresFlagConfig.languagePriority;

/**
 * Accept-Languageヘッダーをパースして優先言語を取得
 */
function parseAcceptLanguageHeader(
  acceptLanguage: string,
  supportedLanguages: readonly string[]
): string[] {
  interface LangQuality {
    lang: string;
    quality: number;
  }

  const languages: LangQuality[] = [];
  const parts = acceptLanguage.split(',');

  for (const part of parts) {
    const [lang, q = '1'] = part.trim().split(';q=');
    const quality = parseFloat(q);
    languages.push({ lang: lang.split('-')[0], quality });
  }

  // 品質でソート
  languages.sort((a, b) => b.quality - a.quality);

  // サポートされている言語のみを返す
  return languages
    .map((item) => item.lang)
    .filter((lang) => supportedLanguages.includes(lang));
}

/**
 * サーバーサイドでのi18nインスタンスを作成する関数
 * 言語の決定順序：
 * 1. クッキーに保存された言語設定
 * 2. ユーザー優先の場合はブラウザの言語設定
 * 3. デフォルト言語
 */
async function createInstance() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(I18N_COOKIE_NAME)?.value;

  let selectedLanguage: string | undefined = undefined;

  // クッキーから言語設定を取得
  if (cookie) {
    selectedLanguage = getLanguageOrFallback(cookie);
  }

  // ユーザー優先設定の場合はブラウザの言語を使用
  if (!selectedLanguage && priority === 'user') {
    const userPreferredLanguage = await getPreferredLanguageFromBrowser();
    selectedLanguage = getLanguageOrFallback(userPreferredLanguage);
  }

  const settings = getI18nSettings(selectedLanguage);

  // i18nextインスタンスを初期化
  if (!i18next.isInitialized) {
    const loadPath = resolve(process.cwd(), 'public/locales/{{lng}}/{{ns}}.json');
    
    await i18next.use(Backend).init({
      ...settings,
      backend: {
        loadPath,
      },
    });
  } else {
    // 既に初期化されている場合は言語を変更
    await i18next.changeLanguage(settings.lng);
  }

  return i18next;
}

// React Cacheを使用してインスタンスを再利用
export const createI18nServerInstance = cache(createInstance);

/**
 * ブラウザのAccept-Languageヘッダーから優先言語を取得
 */
async function getPreferredLanguageFromBrowser() {
  const headersStore = await headers();
  const acceptLanguage = headersStore.get('accept-language');

  if (!acceptLanguage) {
    return;
  }

  const parsed = parseAcceptLanguageHeader(
    acceptLanguage,
    Array.from(languages)
  );
  return parsed[0];
}

/**
 * 指定された言語がサポートされているかチェックし、
 * サポートされていない場合はフォールバック言語を返す
 */
function getLanguageOrFallback(language: string | undefined) {
  let selectedLanguage = language;

  if (!languages.includes(language as SupportedLanguage)) {
    console.warn(
      `Language "${language}" is not supported. Falling back to "${defaultLanguage}"`
    );

    selectedLanguage = defaultLanguage;
  }

  return selectedLanguage;
}
