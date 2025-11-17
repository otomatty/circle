import { redirect } from 'next/navigation';
import { getDatabase } from '~/lib/db/client';

/**
 * チーム別トップページ
 *
 * URLパラメータのチームslugに基づいて、そのチームのダッシュボードを表示します。
 * 認証機能が削除されているため、チームの存在確認のみ行います。
 */
export default async function TeamPage({
  params,
}: { params: { orgId: string } }) {
  // Next.js 14では params を await する必要がある
  const resolvedParams = await Promise.resolve(params);
  const teamSlug = resolvedParams.orgId;

  const db = getDatabase();

  // teamSlugからチームIDを取得
  const team = db
    .prepare('SELECT id FROM teams WHERE slug = ?')
    .get(teamSlug) as { id: string } | undefined;

  if (!team) {
    // チームが存在しない場合はホームに戻す
    return redirect('/');
  }

  // チームのダッシュボードページにリダイレクト
  // 注: ここは要件に応じて、リダイレクトではなく直接コンテンツを表示するように変更可能
  return redirect(`/${teamSlug}/team/CORE/all`);
}
