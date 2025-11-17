import { Inter, Noto_Sans_JP } from 'next/font/google';

/**
 * @sans
 * @description Define here the sans font.
 * By default, it uses the Inter font from Google Fonts.
 */
const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial'],
  preload: true,
  weight: ['400', '500', '700'],
  display: 'swap',
});

/**
 * @noto
 * @description Japanese font using Noto Sans JP from Google Fonts.
 */
const noto = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto',
  preload: true,
  weight: ['400', '500', '700'],
  display: 'swap',
});

/**
 * @heading
 * @description Define here the heading font.
 */
const heading = sans;

// we export these fonts into the root layout
export { sans, heading, noto };
