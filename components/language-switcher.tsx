'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import {
  I18N_COOKIE_NAME,
  type SupportedLanguage,
  languageNames,
  languages,
} from '~/lib/i18n/i18n.settings';

/**
 * 言語切り替えコンポーネント
 *
 * 使用例：
 * ```tsx
 * <LanguageSwitcher />
 * ```
 */
export function LanguageSwitcher() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = useCallback(
    async (newLanguage: SupportedLanguage) => {
      // 言語切り替えのトランジションを開始
      startTransition(async () => {
        try {
          // i18nインスタンスの言語を変更
          await i18n.changeLanguage(newLanguage);

          // クッキーに言語設定を保存
          document.cookie = `${I18N_COOKIE_NAME}=${newLanguage};path=/;max-age=31536000`; // 1年間有効

          // ページを更新して新しい言語を反映
          router.refresh();
        } catch (error) {
          console.error('Failed to change language:', error);
        }
      });
    },
    [i18n, router]
  );

  return (
    <select
      value={i18n.language}
      onChange={(e) =>
        handleLanguageChange(e.target.value as SupportedLanguage)
      }
      disabled={isPending}
      className="px-2 py-1 border rounded-md bg-background"
      aria-label="Select language"
    >
      {languages.map((lang) => (
        <option key={lang} value={lang}>
          {languageNames[lang]}
        </option>
      ))}
    </select>
  );
}
