'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { User } from '~/types/users';
import type { Database as CircleDatabase } from '@kit/supabase/circle-database';

/**
 * データベースからユーザーリストを取得します
 */
export async function getUsers(): Promise<User[]> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  const { data: users, error: usersError } = await supabase
    .schema('circle')
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  if (usersError) {
    console.error('Users取得エラー:', usersError);
    throw new Error('ユーザーデータの取得に失敗しました');
  }

  // ユーザーごとのチーム情報を取得
  const { data: userTeams, error: teamsError } = await supabase
    .schema('circle')
    .from('team_members')
    .select('*');

  if (teamsError) {
    console.error('User teams取得エラー:', teamsError);
    throw new Error('ユーザーチームデータの取得に失敗しました');
  }

  // DBデータをUserの形式に変換
  return users.map((user) => {
    // そのユーザーに紐づくチームIDを取得
    const teamIds = userTeams
      .filter((ut) => ut.user_id === user.id)
      .map((ut) => ut.team_id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url || null,
      teamIds: teamIds,
    };
  }) as User[];
}

/**
 * 担当者ごとの課題数を取得します
 */
export async function getAssigneeCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  // 担当者あり課題
  const { data: assigneeIssuesData, error: assigneeError } = await supabase
    .schema('circle')
    .from('issues')
    .select('assignee_id')
    .not('assignee_id', 'is', null);

  if (assigneeError) {
    console.error('Assignee counts 取得エラー:', assigneeError);
    throw new Error('担当者カウントの取得に失敗しました');
  }

  // 型定義を修正: assignee_id が string | null になり得ることを許容
  const assigneeIssues: { assignee_id: string | null }[] | null =
    assigneeIssuesData;

  if (!assigneeIssues) {
    console.error('Assignee issues data is null');
    throw new Error('Failed to retrieve assignee issues data');
  }

  // 担当者なし課題数を取得
  const { count: unassignedCount, error: unassignedError } = await supabase
    .schema('circle')
    .from('issues')
    .select('*', { count: 'exact', head: true })
    .is('assignee_id', null);

  if (unassignedError) {
    console.error('Unassigned count 取得エラー:', unassignedError);
    throw new Error('未割り当て課題カウントの取得に失敗しました');
  }

  // 各担当者のカウントを集計
  const counts: Record<string, number> = {
    unassigned: unassignedCount || 0,
  };

  for (const item of assigneeIssues) {
    // ループ内で assignee_id が null でないことを確認してからカウント
    if (item.assignee_id !== null) {
      counts[item.assignee_id] = (counts[item.assignee_id] || 0) + 1;
    }
    // 注: DBクエリの .not() フィルターがあるため、実際にはこの if 文は不要なはずだが、
    // 型定義に合わせてTypeScriptを満足させるためには必要。
  }

  return counts;
}
