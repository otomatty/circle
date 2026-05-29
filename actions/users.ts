'use server';

import { getSupabase } from '~/lib/supabase/data';
import type { User } from '~/types/users';

export async function getUsers(): Promise<User[]> {
  const supabase = await getSupabase();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, email, avatar_url, role, status, joined_date')
    .order('name', { ascending: true });

  if (error) {
    console.error('Users fetch error:', error);
    throw new Error('ユーザーデータの取得に失敗しました');
  }

  const { data: memberships, error: membershipError } = await supabase
    .from('team_members')
    .select('user_id, team_id');

  if (membershipError) {
    console.error('Team memberships fetch error:', membershipError);
  }

  return (profiles ?? []).map((profile) => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    role: profile.role ?? undefined,
    status: profile.status ?? undefined,
    joinedDate: profile.joined_date ?? undefined,
    teamIds:
      memberships
        ?.filter((m) => m.user_id === profile.id)
        .map((m) => m.team_id) ?? [],
  }));
}

export async function getAssigneeCounts(): Promise<Record<string, number>> {
  const supabase = await getSupabase();

  const { data: assigneeRows, error } = await supabase
    .from('issue_assignees')
    .select('issue_id, user_id');

  if (error) {
    console.error('Assignee counts fetch error:', error);
    throw new Error('担当者カウントの取得に失敗しました');
  }

  const { data: allIssues, error: issuesError } = await supabase
    .from('issues')
    .select('id');

  if (issuesError) {
    console.error('Issues fetch error for assignee counts:', issuesError);
  }

  const assignedIssueIds = new Set(
    (assigneeRows ?? []).map((row) => row.issue_id)
  );

  const counts: Record<string, number> = {
    unassigned:
      (allIssues ?? []).filter((issue) => !assignedIssueIds.has(issue.id))
        .length ?? 0,
  };

  for (const item of assigneeRows ?? []) {
    if (item.user_id) {
      counts[item.user_id] = (counts[item.user_id] || 0) + 1;
    }
  }

  return counts;
}
