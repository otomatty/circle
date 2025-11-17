'use client';

import { useMemo } from 'react';

import { ThemeProvider } from '~/components/theme-provider';
import { If } from '~/components/ui/if';

import appConfig from '~/config/app.config';
import featuresFlagConfig from '~/config/feature-flags.config';
import { I18nProvider } from '~/lib/i18n/provider';
import { getI18nSettings } from '~/lib/i18n/i18n.settings';

import { ReactQueryProvider } from './react-query-provider';

export function RootProviders({
  lang,
  theme = appConfig.theme,
  children,
}: React.PropsWithChildren<{
  lang: string;
  theme?: string;
}>) {
  const i18nSettings = useMemo(() => getI18nSettings(lang), [lang]);

  return (
    <ReactQueryProvider>
      <I18nProvider settings={i18nSettings}>
        <ThemeProvider
          attribute="class"
          enableSystem
          disableTransitionOnChange
          defaultTheme={theme}
          enableColorScheme={false}
        >
          {children}
        </ThemeProvider>

        <If condition={featuresFlagConfig.enableVersionUpdater}>
          {/* VersionUpdaterは後で実装または削除 */}
        </If>
      </I18nProvider>
    </ReactQueryProvider>
  );
}
