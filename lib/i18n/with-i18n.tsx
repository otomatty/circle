/**
 * with-i18n.tsx
 *
 * このファイルは、サーバーコンポーネントにi18n機能を提供するHOC（Higher-Order Component）を定義します。
 * 主な役割：
 * 1. サーバーコンポーネントでのi18n初期化
 * 2. 翻訳機能のラッピング
 * 3. SSRでの言語設定の適用
 *
 * 使用例：
 * ```tsx
 * export default withI18n(MyServerComponent);
 * ```
 */

import { createI18nServerInstance } from './i18n.server';

type LayoutOrPageComponent<Params> = React.ComponentType<Params>;

/**
 * サーバーコンポーネントをi18n機能でラップするHOC
 *
 * @param Component - ラップするサーバーコンポーネント
 * @returns i18n機能が有効化されたコンポーネント
 */
export function withI18n<Params extends object>(
  Component: LayoutOrPageComponent<Params>
) {
  return async function I18nServerComponentWrapper(params: Params) {
    // サーバーサイドでi18nインスタンスを初期化
    await createI18nServerInstance();

    return <Component {...params} />;
  };
}
