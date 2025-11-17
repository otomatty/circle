/**
 * ナビゲーション設定ファイル
 *
 * このファイルはアプリケーションのナビゲーション構造を定義します。
 * サイドバーやナビゲーションメニューに表示される項目、アイコン、
 * リンク先などを一元管理し、一貫したナビゲーション体験を提供します。
 */

import { Home, User } from 'lucide-react';
import { z } from 'zod';

import pathsConfig from './paths.config';

// アイコンのサイズを統一するためのクラス
const iconClasses = 'w-4';

/**
 * ナビゲーション設定のスキーマ定義
 */
const NavigationConfigSchema = z.object({
  routes: z.array(
    z.object({
      label: z.string(),
      children: z.array(
        z.object({
          label: z.string(),
          path: z.string(),
          Icon: z.any().optional(),
          end: z.boolean().optional(),
        })
      ),
    })
  ),
  style: z.string().optional(),
  sidebarCollapsed: z.string().optional(),
});

/**
 * ナビゲーションルートの定義
 *
 * 各ルートはラベル（多言語対応）とそのサブルート（子要素）を持ちます。
 * 各サブルートには、表示名、パス、アイコン、終端フラグなどを設定できます。
 */
const routes = [
  {
    label: 'common:routes.application', // 「アプリケーション」セクション
    children: [
      {
        label: 'common:routes.home', // 「ホーム」メニュー項目
        path: pathsConfig.app.home, // ホームページへのパス
        Icon: <Home className={iconClasses} />, // ホームアイコン
        end: true, // このルートが終端であることを示す（サブルートを持たない）
      },
    ],
  },
  {
    label: 'common:routes.settings', // 「設定」セクション
    children: [
      {
        label: 'common:routes.profile', // 「プロフィール」メニュー項目
        path: pathsConfig.app.profileSettings, // プロフィール設定ページへのパス
        Icon: <User className={iconClasses} />, // ユーザーアイコン
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

/**
 * ナビゲーション設定の作成と検証
 *
 * ルート定義に加えて、ナビゲーションのスタイルやサイドバーの初期状態（折りたたみ状態）も設定
 */
export const navigationConfig = NavigationConfigSchema.parse({
  routes, // 上で定義したルート
  style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE, // ナビゲーションスタイル（環境変数から取得）
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED, // サイドバーの初期状態（環境変数から取得）
});
