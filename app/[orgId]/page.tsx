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
    // チームが存在しない場合は、最初のチームにリダイレクト
    // 無限ループを防ぐため、直接リダイレクトする
    const firstTeam = db
      .prepare('SELECT slug FROM teams ORDER BY created_at ASC LIMIT 1')
      .get() as { slug: string } | undefined;

    if (firstTeam) {
      return redirect(`/${firstTeam.slug}`);
    }

    // チームが全く存在しない場合は、エラーメッセージを表示
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">チームが見つかりません</h1>
          <p className="text-muted-foreground mb-4">
            指定されたチーム（{teamSlug}）は存在しません。
          </p>
        </div>
      </div>
    );
  }

  // チームのダッシュボードページにリダイレクト
  // 注: ここは要件に応じて、リダイレクトではなく直接コンテンツを表示するように変更可能
  return redirect(`/${teamSlug}/team/CORE/all`);
}
