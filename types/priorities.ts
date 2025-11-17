import type { LucideIcon } from 'lucide-react';

/**
 * 優先度の型定義
 */
export interface Priority {
  id: string;
  name: string;
  icon: string | LucideIcon;
}

/**
 * SQLiteの優先度テーブルの型
 */
export interface DbPriority {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * データベースの優先度レコードを
 * フロントエンド表示用のモックデータ形式に変換するヘルパー関数
 */
export function mapDbPriorityToPriority(
  dbPriority: DbPriority,
  iconComponent?: LucideIcon
): Priority {
  return {
    id: dbPriority.slug,
    name: dbPriority.name,
    icon: iconComponent || dbPriority.icon || 'circle', // アイコンコンポーネントがない場合は文字列アイコン名を使用
  };
}

/**
 * デフォルトの優先度一覧
 * データベースに接続できない場合のフォールバックとして使用
 */
export const DEFAULT_PRIORITIES: Priority[] = [
  {
    id: 'urgent',
    name: '緊急',
    icon: 'alert-triangle',
  },
  {
    id: 'high',
    name: '高',
    icon: 'arrow-up',
  },
  {
    id: 'normal',
    name: '通常',
    icon: 'minus',
  },
  {
    id: 'low',
    name: '低',
    icon: 'arrow-down',
  },
];
