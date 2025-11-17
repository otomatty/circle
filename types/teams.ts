import type { Database as CircleDatabase } from '@kit/supabase/circle-database';
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
 * Supabaseのチームテーブルの型
 * データベース固有の型定義
 */
export type DbTeam = CircleDatabase['circle']['Tables']['teams']['Row'];

/**
 * チームプロジェクト関連テーブルの型
 */
export type DbTeamProject =
  CircleDatabase['circle']['Tables']['team_projects']['Row'];

/**
 * チームメンバー関連テーブルの型
 */
export type DbTeamMember =
  CircleDatabase['circle']['Tables']['team_members']['Row'];

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
