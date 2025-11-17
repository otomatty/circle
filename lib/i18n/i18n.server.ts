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
import {
  initializeServerI18n,
  parseAcceptLanguageHeader,
} from '@kit/i18n/server';

import featuresFlagConfig from '~/config/feature-flags.config';
import {
  I18N_COOKIE_NAME,
  getI18nSettings,
  languages,
  type SupportedLanguage,
} from '~/lib/i18n/i18n.settings';

import { i18nResolver } from './i18n.resolver';

/**
 * 言語優先順位の設定
 * feature flagsで'user'に設定されている場合、ブラウザの設定を優先
 */
const priority = featuresFlagConfig.languagePriority;

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
  return initializeServerI18n(settings, i18nResolver);
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

  return parseAcceptLanguageHeader(acceptLanguage, Array.from(languages))[0];
}

/**
 * 指定された言語がサポートされているかチェックし、
 * サポートされていない場合はフォールバック言語を返す
 */
function getLanguageOrFallback(language: string | undefined) {
  let selectedLanguage = language;

  if (!languages.includes(language as SupportedLanguage)) {
    console.warn(
      `Language "${language}" is not supported. Falling back to "${languages[0]}"`
    );

    selectedLanguage = languages[0];
  }

  return selectedLanguage;
}
