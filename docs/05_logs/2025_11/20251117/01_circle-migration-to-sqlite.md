# Circleアプリケーション SQLite移行作業ログ

## 作業日時
2025年11月17日

## 作業概要
CircleアプリケーションをMakerKit依存から独立させ、SupabaseからSQLiteに移行する作業を実施しました。認証機能を廃止し、SQLiteデータベースを使用するスタンドアロンアプリケーションとして再構築しました。

## 実施した作業

### Phase 2: データベースと認証の置き換え

#### 2.1 SQLiteデータベースの実装
- ✅ `lib/db/schema.sql` - SQLiteスキーマ定義（既存ファイルを確認）
- ✅ `lib/db/client.ts` - SQLiteクライアント（既存ファイルを確認）
- ✅ `scripts/init-database.ts` - データベース初期化スクリプトを作成

#### 2.2 認証関連コードの削除
- ✅ `middleware.ts` - 認証チェックを削除し、最小限の処理のみに変更
- ✅ `components/auth-provider.tsx` - 削除
- ✅ `app/auth/` - 認証ページディレクトリを削除
- ✅ `components/auth/` - 認証関連コンポーネントディレクトリを削除
- ✅ `lib/server/require-user-in-server-component.ts` - 削除
- ✅ `app/layout.tsx` - 認証状態取得処理を削除
- ✅ `app/page.tsx` - Supabase認証を削除し、SQLiteクエリに置き換え

#### 2.3 i18nの実装
- ✅ `lib/i18n/i18n.settings.ts` - `@kit/i18n`への依存を削除し、カスタム実装に変更
- ✅ `lib/i18n/i18n.server.ts` - `i18next-fs-backend`を使用したサーバーサイド実装
- ✅ `lib/i18n/i18n.client.ts` - `i18next-http-backend`を使用したクライアントサイド実装
- ✅ `lib/i18n/provider.tsx` - `I18nextProvider`を使用したプロバイダーコンポーネントを作成
- ✅ `components/root-providers.tsx` - `@kit/i18n`と`@kit/auth`への依存を削除

#### 2.4 UIユーティリティの実装
- ✅ `lib/utils/cn.ts` - `tailwind-merge`と`clsx`を使用したclassNameマージ関数を作成
- ✅ `components/ui/if.tsx` - 条件付きレンダリングコンポーネントを作成
- ✅ `app/layout.tsx` - `sonner`を直接使用するように変更

#### 2.5 SupabaseからSQLiteへの置き換え
以下のServer ActionsファイルをSupabaseクライアントからSQLiteクエリに置き換えました：

- ✅ `actions/issues.ts` - `getIssuesByProjectId`をSQLiteクエリに変更
- ✅ `actions/users.ts` - `getUsers`, `getAssigneeCounts`をSQLiteクエリに変更
- ✅ `actions/teams.ts` - `getTeams`をSQLiteクエリに変更
- ✅ `actions/projects.ts` - `getProjects`, `getProjectCounts`をSQLiteクエリに変更
- ✅ `actions/status.ts` - `getStatuses`, `getStatusCounts`をSQLiteクエリに変更
- ✅ `actions/priorities.ts` - `getPriorities`, `getPriorityCounts`をSQLiteクエリに変更
- ✅ `actions/labels.ts` - `getLabels`, `getLabelCounts`をSQLiteクエリに変更

### Phase 4: 設定ファイルの調整

#### 4.1 package.json
- ✅ `@kit/*`パッケージをすべて削除
- ✅ `@supabase/supabase-js`, `@supabase/ssr`を削除
- ✅ `@makerkit/*`パッケージを削除
- ✅ `better-sqlite3`を追加
- ✅ `@types/better-sqlite3`を追加
- ✅ `i18next`, `i18next-fs-backend`, `i18next-http-backend`を追加
- ✅ `clsx`を追加
- ✅ Supabase関連のスクリプトを削除し、`db:init`スクリプトを追加

#### 4.2 tsconfig.json
- ✅ `@kit/tsconfig`への依存を削除
- ✅ 独立したTypeScript設定に変更
- ✅ 重複していた`plugins`フィールドを修正

#### 4.3 next.config.mjs
- ✅ `@kit/*`パッケージへの参照を削除
- ✅ `INTERNAL_PACKAGES`を空配列に変更
- ✅ Supabase関連のリモート画像パターン設定を削除

#### 4.4 型定義ファイルの更新
以下の型定義ファイルから`@kit/supabase/circle-database`への依存を削除し、SQLiteスキーマに基づいた型定義に変更しました：

- ✅ `types/teams.ts` - `DbTeam`, `DbTeamProject`, `DbTeamMember`を直接定義
- ✅ `types/issues.ts` - `DbIssue`, `DbIssueLabel`, `DbIssueAssignee`, `DbIssueRelation`を直接定義
- ✅ `types/users.ts` - `DbUser`を直接定義
- ✅ `types/status.ts` - `DbStatus`を直接定義
- ✅ `types/projects.ts` - `DbProject`を直接定義
- ✅ `types/priorities.ts` - `DbPriority`を直接定義
- ✅ `types/index.ts` - `CircleDatabase`のエクスポートを削除

## 変更されたファイル一覧

### 新規作成
- `lib/utils/cn.ts`
- `components/ui/if.tsx`
- `lib/i18n/provider.tsx`
- `scripts/init-database.ts`

### 削除
- `components/auth-provider.tsx`
- `app/auth/` (ディレクトリ全体)
- `components/auth/` (ディレクトリ全体)
- `lib/server/require-user-in-server-component.ts`

### 修正
- `middleware.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `components/root-providers.tsx`
- `lib/i18n/i18n.settings.ts`
- `lib/i18n/i18n.server.ts`
- `lib/i18n/i18n.client.ts`
- `actions/issues.ts`
- `actions/users.ts`
- `actions/teams.ts`
- `actions/projects.ts`
- `actions/status.ts`
- `actions/priorities.ts`
- `actions/labels.ts`
- `package.json`
- `tsconfig.json`
- `next.config.mjs`
- `types/teams.ts`
- `types/issues.ts`
- `types/users.ts`
- `types/status.ts`
- `types/projects.ts`
- `types/priorities.ts`
- `types/index.ts`

## 今後の作業内容

### Phase 5: テストと動作確認

#### 5.1 依存関係のインストール
- ✅ `bun install`を実行して新しい依存関係をインストール
- ✅ インストールエラーの確認と修正（better-sqlite3の再インストール）

#### 5.2 データベースの初期化
- ✅ `bun run db:init`を実行してデータベースを初期化（bunx tsxを使用）
- ✅ スキーマが正しく適用されることを確認
- ✅ データベースファイル（`database.sqlite`）が作成されることを確認

#### 5.3 ビルドの確認
- ✅ `bun run build`を実行してビルドエラーを確認
- ✅ TypeScriptの型エラーを修正
- ✅ リンターエラーを修正（環境変数の設定が必要）

#### 5.4 動作確認
- [ ] 開発サーバー（`bun run dev`）を起動
- [ ] 各ページが正常に表示されることを確認
- [ ] データベースクエリが正常に動作することを確認
- [ ] i18nが正常に動作することを確認

#### 5.5 残存する@kitパッケージの参照の修正
以下のファイルで`@kit/ui`や`@kit/*`への参照を修正しました：

- ✅ `components/layout/sidebar/`配下のファイル
- ✅ `components/personal-account-dropdown-container.tsx` - 削除
- ✅ その他のコンポーネントファイル

以下のコンポーネントをshadcn/uiに置き換えました：
- ✅ `@kit/ui/button` → `shadcn/ui`のButtonコンポーネント
- ✅ `@kit/ui/dropdown-menu` → `shadcn/ui`のDropdownMenuコンポーネント
- ✅ `@kit/ui/sidebar` → `shadcn/ui`のSidebarコンポーネント
- ✅ `@kit/ui/collapsible` → `shadcn/ui`のCollapsibleコンポーネント
- ✅ `@kit/ui/popover` → `shadcn/ui`のPopoverコンポーネント
- ✅ `@kit/ui/command` → `shadcn/ui`のCommandコンポーネント
- ✅ `@kit/ui/input` → `shadcn/ui`のInputコンポーネント
- ✅ `@kit/ui/checkbox` → `shadcn/ui`のCheckboxコンポーネント
- ✅ `@kit/ui/textarea` → `shadcn/ui`のTextareaコンポーネント
- ✅ `@kit/ui/switch` → `shadcn/ui`のSwitchコンポーネント
- ✅ `@kit/ui/label` → `shadcn/ui`のLabelコンポーネント
- ✅ `@kit/ui/heading` → カスタムHeadingコンポーネント
- ✅ `@kit/ui/badge` → `shadcn/ui`のBadgeコンポーネント
- ✅ `@kit/ui/avatar` → `shadcn/ui`のAvatarコンポーネント
- ✅ `@kit/ui/tooltip` → `shadcn/ui`のTooltipコンポーネント
- ✅ `@kit/ui/navigation-schema` → カスタム実装

#### 5.6 データベースシードスクリプトの更新
- ✅ `scripts/seed-database.ts`をSupabaseからSQLiteに変更
- [ ] シードデータが正しく挿入されることを確認

#### 5.7 その他の修正
- ✅ `lib/server/gmail/service.ts`でSupabaseを使用している箇所を修正（一旦無効化）
- ✅ `components/personal-account-dropdown-container.tsx`を削除
- ✅ `config/auth.config.ts`を削除
- ✅ `app/[orgId]/page.tsx`からSupabase参照を削除し、SQLiteクエリに置き換え
- ✅ `app/not-found.tsx`からSupabase参照を削除
- ✅ `motion/react`を`framer-motion`に置き換え

#### 5.8 ドキュメントの更新
- ✅ `README.md`の更新（依存関係、セットアップ手順など）
- ✅ `.env.example`の作成（Supabase関連の環境変数を削除）
- ✅ 移行計画書（`MIGRATION_PLAN.md`）の完了状況を更新

## 注意事項

1. **データベースファイル**: SQLiteファイル（`database.sqlite`）は`.gitignore`に追加済みです
2. **環境変数**: Supabase関連の環境変数（`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`など）は不要になりました。`.env.example`を参照してください
3. **認証**: すべての認証機能が削除されたため、アプリケーションは誰でもアクセス可能です
4. **データベーススクリプト**: `bun run db:init`と`bun run seed:database`は`bunx tsx`を使用して実行されます（better-sqlite3のネイティブモジュール対応のため）
5. **Gmail機能**: `lib/server/gmail/service.ts`は一旦無効化されています。SQLiteスキーマにGmail関連テーブルを追加する必要があります
6. **ビルド**: ビルドは成功しましたが、環境変数の設定が必要です。`.env.local`ファイルを作成し、`.env.example`を参考に設定してください

## 参考資料

- 移行計画書: `MIGRATION_PLAN.md`
- SQLiteスキーマ: `lib/db/schema.sql`
- SQLiteクライアント: `lib/db/client.ts`

