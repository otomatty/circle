import type { Database as CircleDatabase } from '@kit/supabase/circle-database';
import type { LucideIcon } from 'lucide-react';
import { getIconFromString } from '~/utils/icon-utils';

/**
 * ステータス（状態）の型定義
 * ex: 未着手、進行中、完了など
 */
export interface Status {
  id: string;
  name: string;
  color: string;
  icon: LucideIcon;
}

/**
 * Supabaseのステータステーブルの型
 */
export type DbStatus = CircleDatabase['circle']['Tables']['statuses']['Row'];

/**
 * データベースのステータスレコードを
 * フロントエンド表示用のモックデータ形式に変換するヘルパー関数
 */
export function mapDbStatusToStatus(dbStatus: DbStatus): Status {
  return {
    id: dbStatus.slug,
    name: dbStatus.name,
    color: dbStatus.color ?? '#888888', // 色情報がない場合はグレー
    icon: getIconFromString(dbStatus.icon ?? 'circle'),
  };
}

/**
 * デフォルトのステータス一覧
 * データベースに接続できない場合のフォールバックとして使用
 */
export const DEFAULT_STATUSES: Status[] = [
  {
    id: 'not-started',
    name: '未着手',
    color: '#CBD5E1',
    icon: getIconFromString('circle'),
  },
  {
    id: 'in-progress',
    name: '進行中',
    color: '#FBCFE8',
    icon: getIconFromString('spinner'),
  },
  {
    id: 'done',
    name: '完了',
    color: '#A7F3D0',
    icon: getIconFromString('check-circle'),
  },
  {
    id: 'cancelled',
    name: 'キャンセル',
    color: '#FEE2E2',
    icon: getIconFromString('x-circle'),
  },
];
