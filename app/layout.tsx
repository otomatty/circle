import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import { cn } from '~/lib/utils/cn';
import { RootProviders } from '~/components/root-providers';
import { heading, sans } from '~/lib/fonts';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Circle | Saedgewell',
    template: 'Circle | Saedgewell',
  },
  description: 'Linearのようなタスク管理アプリです。',
  keywords: [
    'プロダクトエンジニア',
    'Web開発',
    'Next.js',
    'React',
    'TypeScript',
    'タスク管理',
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const i18nInstance = await createI18nServerInstance();
  const language = i18nInstance.language || 'ja';
  const theme = await getTheme();
  const className = getClassName(theme);

  return (
    <html lang={language} className={className}>
      <body suppressHydrationWarning>
        <RootProviders theme={theme} lang={language}>
          <main className="flex-1">{children}</main>
        </RootProviders>

        <Toaster richColors={true} theme={theme} position="top-center" />
      </body>
    </html>
  );
}

function getClassName(theme?: string) {
  const dark = theme === 'dark';
  const light = !dark;

  const font = [sans.variable, heading.variable].reduce<string[]>(
    (acc, curr) => {
      if (acc.includes(curr)) return acc;

      acc.push(curr);
      return acc;
    },
    []
  );

  return cn('bg-background min-h-screen antialiased', font.join(' '), {
    dark,
    light,
  });
}

async function getTheme() {
  const cookiesStore = await cookies();
  return cookiesStore.get('theme')?.value as 'light' | 'dark' | 'system';
}
