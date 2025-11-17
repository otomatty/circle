import type { Database as CircleDatabase } from '@kit/supabase/circle-database';
import type { LabelInterface } from './labels';
import type { Priority } from './priorities';
import type { Project } from './projects';
import type { Status } from './status';
import type { User } from './users';
import { getIconFromString } from '../utils/icon-utils';

/**
 * タスク（Issue）の型定義
 */
export interface Issue {
  id: string;
  identifier: string;
  title: string;
  description: string;
  status: Status;
  assignees: User | null;
  priority: Priority;
  labels: LabelInterface[];
  createdAt: string;
  cycleId: string;
  project?: Project;
  subissues?: string[];
  rank: string;
}

/**
 * Supabaseのissuesテーブルの型
 */
export type DbIssue = CircleDatabase['circle']['Tables']['issues']['Row'];

/**
 * Supabaseのissue_labelsテーブルの型
 */
export type DbIssueLabel =
  CircleDatabase['circle']['Tables']['issue_labels']['Row'];

/**
 * Supabaseのissue_assigneesテーブルの型
 */
export type DbIssueAssignee =
  CircleDatabase['circle']['Tables']['issue_assignees']['Row'];

/**
 * Supabaseのissue_relationsテーブルの型
 */
export type DbIssueRelation =
  CircleDatabase['circle']['Tables']['issue_relations']['Row'];

/**
 * データベースのissueレコードを
 * フロントエンド表示用の形式に変換するヘルパー関数
 */
export function mapDbIssueToIssue(
  dbIssue: DbIssue & {
    status?: Status;
    priority?: Priority;
    assignees?: User;
    labels?: Array<{ id: string; name: string; color: string }>;
    project?: Project;
  }
): Issue {
  return {
    id: dbIssue.id,
    identifier: dbIssue.identifier,
    title: dbIssue.title,
    description: dbIssue.description ?? '',
    status: dbIssue.status || {
      id: dbIssue.status_id || 'not-started',
      name: '未着手',
      color: '#CBD5E1',
      icon: getIconFromString('circle'),
    },
    priority: dbIssue.priority || {
      id: dbIssue.priority_id || 'normal',
      name: '通常',
      icon: 'circle',
    },
    assignees: dbIssue.assignees ?? null,
    createdAt: dbIssue.created_at || new Date().toISOString(),
    labels: dbIssue.labels || [],
    cycleId: dbIssue.cycle_id ?? '',
    rank: dbIssue.rank,
    project: dbIssue.project,
  };
}

/**
 * 優先度に基づいてタスク（Issue）をソートする関数
 * 数値が小さいほど優先度が高い
 */
export function sortIssuesByPriority(issues: Issue[]): Issue[] {
  const priorityOrder: Record<string, number> = {
    urgent: 0,
    high: 1,
    normal: 2,
    low: 3,
  };

  return [...issues].sort((a, b) => {
    const aOrder = priorityOrder[a.priority.id] ?? 999;
    const bOrder = priorityOrder[b.priority.id] ?? 999;
    return aOrder - bOrder;
  });
}
