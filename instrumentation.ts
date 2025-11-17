/**
 * インストゥルメンテーション設定ファイル
 *
 * このファイルはNext.jsアプリケーションのモニタリングインストゥルメンテーションを
 * 登録するために使用されます。アプリケーションのパフォーマンス計測や
 * エラー監視のための設定を行います。
 */

import type { Instrumentation } from 'next';

/**
 * リクエスト処理中にエラーが発生した場合に呼び出される関数
 *
 * エラーをキャプチャし、モニタリングサービスに送信するために使用されます。
 * 現在の実装ではエラーをコンソールに出力するだけですが、
 * 本番環境では外部のエラー監視サービス（Sentry、Datadog、New Relicなど）に
 * エラー情報を送信するように拡張できます。
 *
 * @param err - 発生したエラーオブジェクト
 */
export const onRequestError: Instrumentation.onRequestError = (err) => {
  console.error('サーバーサイドエラー:', err);
};
