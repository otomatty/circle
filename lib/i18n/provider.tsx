/**
 * i18n/provider.tsx
 *
 * i18nプロバイダーコンポーネント
 * react-i18nextのI18nextProviderを使用
 */

'use client';

import { I18nextProvider } from 'react-i18next';
import { useEffect, useState } from 'react';

import { createI18nClientInstance } from './i18n.client';
import type { I18nSettings } from './i18n.settings';

interface I18nProviderProps {
  settings: I18nSettings;
  resolver?: (language: string, namespace: string) => Promise<Record<string, string>>;
  children: React.ReactNode;
}

/**
 * i18nプロバイダーコンポーネント
 */
export function I18nProvider({ settings, children }: I18nProviderProps) {
  const [i18nInstance, setI18nInstance] = useState<typeof import('i18next') | null>(null);

  useEffect(() => {
    createI18nClientInstance().then((instance) => {
      setI18nInstance(instance);
    });
  }, []);

  if (!i18nInstance) {
    return <>{children}</>;
  }

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}

