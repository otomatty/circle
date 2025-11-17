import { initializeI18nClient } from '@kit/i18n/client';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  getI18nSettings,
  defaultI18nNamespaces,
  languages,
} from './i18n.settings';
import { i18nResolver } from './i18n.resolver';

let isInitialized = false;

export async function createI18nClientInstance() {
  if (isInitialized || i18next.isInitialized) {
    return i18next;
  }

  try {
    const settings = getI18nSettings(undefined);

    // React用のi18nextモジュールを初期化
    i18next.use(initReactI18next);

    // 明示的な設定を追加
    Object.assign(settings, {
      fallbackLng: 'ja',
      ns: defaultI18nNamespaces,
      defaultNS: 'common',
      fallbackNS: defaultI18nNamespaces,
      supportedLngs: languages,
      load: 'all',
      preload: languages,
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
    });

    const instance = await initializeI18nClient(settings, i18nResolver);

    // グローバルなi18nextインスタンスを設定
    if (!isInitialized) {
      Object.assign(i18next, instance);
      isInitialized = true;
    }

    return instance;
  } catch (error) {
    console.error('Failed to initialize i18n client:', error);
    throw error;
  }
}
