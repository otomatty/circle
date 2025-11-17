/**
 * i18n.client.ts
 *
 * クライアントサイドでのi18n機能の初期化を担当します
 */

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

import { getI18nSettings } from './i18n.settings';

let isInitialized = false;

/**
 * クライアントサイドでのi18nインスタンスを作成する関数
 */
export async function createI18nClientInstance() {
  if (isInitialized || i18next.isInitialized) {
    return i18next;
  }

  try {
    const settings = getI18nSettings(undefined);

    // React用のi18nextモジュールを初期化
    await i18next
      .use(HttpBackend)
      .use(initReactI18next)
      .init({
        ...settings,
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
      });

    isInitialized = true;

    return i18next;
  } catch (error) {
    console.error('Failed to initialize i18n client:', error);
    throw error;
  }
}
