import type { Database as CircleDatabase } from '@kit/supabase/circle-database';
import type { Status } from './status';
import type { LucideIcon } from 'lucide-react';
import { getIconFromString } from '../utils/icon-utils';

/**
 * プロジェクトの基本情報を保持するインターフェース
 */
export interface Project {
  id: string;
  name: string;
  icon: LucideIcon;
  percentComplete: number | null;
  status: Status;
}

/**
 * Supabaseのプロジェクトテーブルの型
 */
export type DbProject = CircleDatabase['circle']['Tables']['projects']['Row'];

/**
 * データベースのプロジェクトレコードを
 * フロントエンド表示用のモックデータ形式に変換するヘルパー関数
 */
export function mapDbProjectToProject(
  dbProject: DbProject,
  statuses: Status[]
): Project {
  const projectStatus = statuses.find((s) => s.id === dbProject.status_id) ??
    statuses.find((s) => s.id === 'not-started') ?? {
      id: 'not-started',
      name: '未着手',
      color: '#CBD5E1',
      icon: getIconFromString('circle'),
    };

  return {
    id: dbProject.id,
    name: dbProject.name,
    icon: getIconFromString(dbProject.icon ?? 'folder'),
    percentComplete: dbProject.percent_complete,
    status: projectStatus,
  };
}

/**
 * プロジェクトをステータスでフィルタリングする関数
 */
export function filterProjectsByStatus(
  projects: Project[],
  statusId: string
): Project[] {
  return projects.filter((project) => project.status.id === statusId);
}
