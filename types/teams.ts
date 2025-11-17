import type { Project } from './projects';
import type { User } from './users';

/**
 * チームのモックデータの型定義
 * フロントエンドでの表示に使用されるデータ構造
 */
export interface Team {
  id: string;
  name: string;
  icon: string;
  joined: boolean;
  color: string;
  members: User[];
  projects: Project[];
}

/**
 * SQLiteのチームテーブルの型
 * データベース固有の型定義
 */
export interface DbTeam {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * チームプロジェクト関連テーブルの型
 */
export interface DbTeamProject {
  id: string;
  team_id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * チームメンバー関連テーブルの型
 */
export interface DbTeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

/**
 * DBから取得したチームデータをモックデータ互換の形式に変換するヘルパー関数
 * (mockデータへの変換が必要な場合に使用)
 */
export function mapDbTeamToTeam(
  dbTeam: DbTeam,
  projects: Project[] = [],
  members: User[] = []
): Team {
  return {
    id: dbTeam.slug,
    name: dbTeam.name,
    icon: dbTeam.icon ?? '👥', // アイコンがない場合はデフォルトアイコン
    color: dbTeam.color ?? '#888888', // 色が未指定の場合はデフォルト色
    joined: true, // デフォルトはtrueとする
    projects,
    members,
  };
}
