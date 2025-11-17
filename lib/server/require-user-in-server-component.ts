import 'server-only';

import { cache } from 'react';

import { redirect } from 'next/navigation';

import {
  requireUser,
  type UserRequireClient,
} from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * @name requireUserInServerComponent
 * @description サーバーコンポーネントでユーザーが認証されていることを要求します。
 * この関数は複数のサーバーコンポーネントで再利用されます - リクエストごとにデータが一度だけ取得されるようにキャッシュされています。
 * サーバーコンポーネントでは、1つのリクエスト内で複数回データベースにアクセスする必要がないように、
 * `requireUser`の代わりにこの関数を使用してください。
 *
 * @example
 * // サーバーコンポーネント内での使用例
 * const ServerComponent = async () => {
 *   const user = await requireUserInServerComponent();
 *   // user オブジェクトを使った処理...
 *   return <div>ようこそ、{user.name}さん</div>;
 * };
 *
 * @returns ユーザーデータを含むオブジェクト。認証されていない場合はリダイレクトします。
 */
export const requireUserInServerComponent = cache(async () => {
  const client = getSupabaseServerClient();
  const result = await requireUser(client as unknown as UserRequireClient);

  if (result.error) {
    redirect(result.redirectTo);
  }

  return result.data;
});
