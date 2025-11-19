'use server';

import { getDatabase } from '~/lib/db/client';
import { handleDatabaseAction } from '~/lib/errors/handler';
import type { User } from '~/types/users';

/**
 * データベースからユーザーリストを取得します
 */
export async function getUsers(): Promise<User[]> {
  return handleDatabaseAction(
    async () => {
      const db = getDatabase();

      const users = db
        .prepare('SELECT * FROM users ORDER BY name ASC')
        .all() as Array<{
        id: string;
        name: string;
        email: string;
        avatar_url: string | null;
      }>;

      // ユーザーごとのチーム情報を取得
      const userTeams = db
        .prepare('SELECT user_id, team_id FROM team_members')
        .all() as Array<{
        user_id: string;
        team_id: string;
      }>;

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
    },
    {
      actionName: 'getUsers',
      defaultErrorMessage: 'ユーザーデータの取得に失敗しました',
      i18nKey: 'errors.actions.getUsers',
    }
  );
}

/**
 * 担当者ごとの課題数を取得します
 */
export async function getAssigneeCounts(): Promise<Record<string, number>> {
  return handleDatabaseAction(
    async () => {
      const db = getDatabase();

      // 担当者あり課題を取得
      const assigneeIssues = db
        .prepare(
          `
        SELECT ia.user_id as assignee_id
        FROM issue_assignees ia
        INNER JOIN issues i ON ia.issue_id = i.id
      `
        )
        .all() as Array<{
        assignee_id: string;
      }>;

      // 担当者なし課題数を取得
      const unassignedCount = db
        .prepare(
          `
        SELECT COUNT(*) as count
        FROM issues i
        WHERE NOT EXISTS (
          SELECT 1 FROM issue_assignees ia WHERE ia.issue_id = i.id
        )
      `
        )
        .get() as { count: number } | undefined;

      // 各担当者のカウントを集計
      const counts: Record<string, number> = {
        unassigned: unassignedCount?.count || 0,
      };

      for (const item of assigneeIssues) {
        if (item.assignee_id !== null) {
          counts[item.assignee_id] = (counts[item.assignee_id] || 0) + 1;
        }
      }

      return counts;
    },
    {
      actionName: 'getAssigneeCounts',
      defaultErrorMessage: '担当者カウントの取得に失敗しました',
      i18nKey: 'errors.actions.getAssigneeCounts',
    }
  );
}
