/**
 * i18n.resolver.ts
 *
 * このファイルは、翻訳ファイルの動的ロードを担当します。
 * 主な役割：
 * 1. 言語ごとの翻訳ファイルの動的インポート
 * 2. 名前空間ごとの翻訳データの解決
 * 3. 翻訳ファイルのパス解決
 *
 * 翻訳ファイルの構造：
 * public/
 *   locales/
 *     ja/
 *       common.json
 *       auth.json
 *     en/
 *       common.json
 *       auth.json
 */

import { defaultLanguage } from './i18n.settings';

// メモリキャッシュの実装
const translationCache = new Map<string, Record<string, string>>();

/**
 * 指定された言語と名前空間の翻訳ファイルを動的にロードする関数
 *
 * @param language - ロードする言語（例：'ja', 'en'）
 * @param namespace - ロードする名前空間（例：'common', 'auth'）
 * @returns 翻訳データのオブジェクト
 */
export async function i18nResolver(language: string, namespace: string) {
  try {
    // キャッシュキーの生成
    const cacheKey = `${language}:${namespace}`;

    // キャッシュにある場合はキャッシュから返す
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey) as Record<string, string>;
    }

    // 翻訳ファイルの動的インポート
    const data = await import(
      `../../public/locales/${language}/${namespace}.json`
    ).catch((error) => {
      console.error(
        `Failed to load translation file: ${language}/${namespace}.json`,
        error
      );

      // 要求された言語がデフォルト言語でない場合、デフォルト言語を試行
      if (language !== defaultLanguage) {
        console.warn(
          `Falling back to default language (${defaultLanguage}) for namespace: ${namespace}`
        );
        return import(
          `../../public/locales/${defaultLanguage}/${namespace}.json`
        );
      }

      // デフォルト言語でも失敗した場合は空のオブジェクトを返す
      return { default: {} };
    });

    // キャッシュに保存
    translationCache.set(cacheKey, data.default);

    return data.default as Record<string, string>;
  } catch (error) {
    console.error(
      `Critical error loading translation: ${language}/${namespace}.json`,
      error
    );
    return {};
  }
}
