/**
 * サイトマップ生成ルート
 *
 * このファイルはサイトのサイトマップXMLを動的に生成するためのAPIルートです。
 * 検索エンジンがサイト内のページを効率的にクロールできるように、
 * サイト内の全ページのURLリストを提供します。
 */

import { getServerSideSitemap } from 'next-sitemap';

import appConfig from '~/config/app.config';

/**
 * サイトマップの最大有効期間（秒）
 *
 * この値はサイトマップのCache-Controlヘッダーを設定するために使用されます。
 * デフォルトでは、Cache-Controlヘッダーは 'public, max-age=600, s-maxage=3600' に設定されます。
 * これは、サイトマップがブラウザやCDNで600秒（10分）キャッシュされ、
 * 3600秒（1時間）経過後に古いと見なされることを意味します。
 */
const MAX_AGE = 60;
const S_MAX_AGE = 3600;

/**
 * GETリクエストハンドラー
 *
 * サイトマップXMLを生成して返します。
 * Cache-Controlヘッダーを設定してキャッシュ戦略を制御します。
 *
 * @returns サイトマップXMLレスポンス
 */
export async function GET() {
  const paths = getPaths();

  const headers = {
    'Cache-Control': `public, max-age=${MAX_AGE}, s-maxage=${S_MAX_AGE}`,
  };

  return getServerSideSitemap([...paths], headers);
}

/**
 * サイトマップに含めるパスを取得する関数
 *
 * サイト内の全ページのパスを定義し、サイトマップエントリに変換します。
 * 各エントリには、完全なURL（locプロパティ）と最終更新日（lastmodプロパティ）が含まれます。
 *
 * @returns サイトマップエントリの配列
 */
function getPaths() {
  const paths = [
    '/',
    '/faq',
    '/cookie-policy',
    '/terms-of-service',
    '/privacy-policy',
    // 他のパスをここに追加
  ];

  return paths.map((path) => {
    return {
      loc: new URL(path, appConfig.url).href,
      lastmod: new Date().toISOString(),
    };
  });
}
