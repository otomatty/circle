/**
 * パス設定ファイル
 *
 * このファイルはアプリケーション内の各種パス（URL）を一元管理します。
 * 認証関連のパスやアプリケーションのメインページへのパスなどを定義し、
 * アプリケーション全体で一貫したルーティングを実現します。
 */

import { z } from 'zod';

/**
 * パス設定のスキーマ定義
 * Zodを使用して型安全な設定オブジェクトを定義
 */
const PathsSchema = z.object({
  auth: z.object({
    signIn: z.string().min(1), // サインインページのパス
    signUp: z.string().min(1), // サインアップページのパス
    verifyMfa: z.string().min(1), // 多要素認証確認ページのパス
    callback: z.string().min(1), // 認証コールバックページのパス
    passwordReset: z.string().min(1), // パスワードリセットページのパス
    passwordUpdate: z.string().min(1), // パスワード更新ページのパス
  }),
  app: z.object({
    home: z.string().min(1), // アプリケーションのホームページパス
    profileSettings: z.string().min(1), // プロフィール設定ページのパス
  }),
});

/**
 * パス設定の実際の値を定義
 * 各パスは一箇所で管理され、アプリケーション全体で参照される
 */
const pathsConfig = PathsSchema.parse({
  auth: {
    signIn: '/auth/sign-in', // サインインページ
    signUp: '/auth/sign-up', // サインアップページ
    verifyMfa: '/auth/verify', // 多要素認証確認ページ
    callback: '/auth/callback', // 認証コールバックページ
    passwordReset: '/auth/password-reset', // パスワードリセットページ
    passwordUpdate: '/update-password', // パスワード更新ページ
  },
  app: {
    home: '/', // アプリケーションのホームページ
    profileSettings: '/[orgId]', // プロフィール設定ページ
  },
} satisfies z.infer<typeof PathsSchema>);

export default pathsConfig;
