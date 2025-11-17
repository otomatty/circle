/**
 * ユーザー状態の型定義
 */
export type UserStatus = 'オンライン' | 'オフライン' | '離席中';

/**
 * ユーザー情報の型定義
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role?: string;
  status?: UserStatus;
  joinedDate?: string;
  teamIds?: string[];
}

/**
 * SQLiteのユーザーテーブルの型
 */
export interface DbUser {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  status: UserStatus | null;
  joined_date: string;
  created_at: string;
  updated_at: string;
}

/**
 * データベースのユーザーレコードを
 * フロントエンド表示用のモックデータ形式に変換するヘルパー関数
 */
export function mapDbUserToUser(dbUser: DbUser, teamIds: string[] = []): User {
  const dbStatus = dbUser.status;
  let mappedStatus: UserStatus | undefined = undefined;

  // DBからのステータス文字列を検証し、UserStatus型にマッピング
  if (
    dbStatus === 'オンライン' ||
    dbStatus === 'オフライン' ||
    dbStatus === '離席中'
  ) {
    mappedStatus = dbStatus;
  } else if (dbStatus) {
    // 予期しないステータス値の場合（ログ出力など）
    console.warn(
      `Invalid user status from DB for user ${dbUser.id}: ${dbStatus}`
    );
    // ここでは undefined にフォールバックする
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    avatarUrl: dbUser.avatar_url,
    role: dbUser.role ?? 'メンバー',
    status: mappedStatus, // 検証/マッピングされたステータスを使用
    joinedDate: dbUser.joined_date ?? new Date().toISOString(),
    teamIds,
  };
}

/**
 * ユーザーに付与可能なロール一覧
 */
export const USER_ROLES = [
  'オーナー',
  '管理者',
  'メンバー',
  'ゲスト',
  '閲覧のみ',
];
