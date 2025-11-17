import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Database } from '@kit/supabase/circle-database';

/**
 * チーム別トップページ
 *
 * URLパラメータのチームslugに基づいて、そのチームのダッシュボードを表示します。
 * ユーザーがそのチームに所属していない場合は、アクセス拒否またはホームページにリダイレクトします。
 */
export default async function TeamPage({
  params,
}: { params: { orgId: string } }) {
  // Next.js 14では params を await する必要がある
  const resolvedParams = await Promise.resolve(params);
  const teamSlug = resolvedParams.orgId;

  const supabase = getSupabaseServerClient<Database>();

  // ユーザー認証状態を確認
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  // teamSlugからチームIDを取得
  const { data: team } = await supabase
    .schema('circle')
    .from('teams')
    .select('id')
    .eq('slug', teamSlug)
    .single();

  if (!team) {
    // チームが存在しない場合はホームに戻す
    return redirect('/');
  }

  // ユーザーがこのチームに所属しているか確認
  const { data: membership } = await supabase
    .schema('circle')
    .from('team_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('team_id', team.id)
    .single();

  // 所属していない場合はホームページにリダイレクト
  if (!membership) {
    return redirect('/');
  }

  // チームのダッシュボードページにリダイレクト
  // 注: ここは要件に応じて、リダイレクトではなく直接コンテンツを表示するように変更可能
  return redirect(`/${teamSlug}/team/CORE/all`);
}
