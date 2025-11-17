# Circleアプリケーション独立化移行計画

## 概要

Circleアプリケーションをモノレポから独立したリポジトリに移行し、MakerKit依存を削除します。
**認証機能は廃止し、SupabaseからSQLiteに移行します。**

## 変更点

### 認証の廃止
- すべての認証関連コードを削除
- 認証が必要なミドルウェアを簡素化
- 認証プロバイダーを削除

### データベースの移行
- Supabase → SQLite
- `better-sqlite3`または`@libsql/client`を使用
- マイグレーションスクリプトを作成

## 現状分析

### 使用されている@kitパッケージ

1. **@kit/ui**
   - `Toaster` (sonner) → `sonner`を直接使用
   - `cn` (utils) → `tailwind-merge`を直接使用
   - `If` → 簡単なコンポーネントとして実装
   - `VersionUpdater` → 必要に応じて実装または削除

2. **@kit/i18n**
   - `I18nProvider` → `react-i18next`の`I18nextProvider`を使用
   - `initializeServerI18n` → カスタム実装
   - `parseAcceptLanguageHeader` → カスタム実装
   - `createI18nSettings` → カスタム実装

3. **@kit/supabase** → **削除（SQLiteに置き換え）**
   - すべてのSupabaseクライアントを削除
   - SQLiteクライアント（`better-sqlite3`）に置き換え
   - Database型 → SQLiteスキーマから生成

4. **@kit/auth** → **削除（認証廃止）**
   - すべての認証関連コードを削除

5. **@kit/next** → **削除（認証廃止）**
   - `getAuthState`など認証関連の関数を削除

6. **@kit/types**
   - 型定義 → 既存の`types/`ディレクトリを使用

7. **@kit/accounts**
   - アカウント管理機能 → 既存のコンポーネントを確認して必要部分を移行

## 移行手順

### Phase 1: 準備と分析

1. ✅ 依存関係の分析（完了）
2. 必要なファイルのリストアップ
3. 新しいリポジトリの作成

### Phase 2: データベースと認証の置き換え

#### 2.1 SQLiteデータベースの実装

- `lib/db/client.ts` - SQLiteクライアントの初期化
- `lib/db/schema.sql` - SQLiteスキーマ定義
- `lib/db/migrations/` - マイグレーションファイル
- `lib/db/types.ts` - SQLiteから生成した型定義（drizzle-ormを使用）

**使用するテーブル（circleスキーマ）:**
- `statuses` - ステータス
- `priorities` - 優先度
- `labels` - ラベル
- `users` - ユーザー（認証なし、単なるデータ）
- `teams` - チーム
- `team_members` - チームメンバー
- `projects` - プロジェクト
- `team_projects` - チームとプロジェクトの関連
- `cycles` - サイクル（スプリント）
- `issues` - タスク（イシュー）
- `issue_assignees` - タスクのアサイン
- `issue_labels` - タスクのラベル
- `issue_relations` - サブタスク関係

#### 2.2 認証関連コードの削除

- `middleware.ts` - 認証チェックを削除
- `components/auth-provider.tsx` - 削除
- `components/auth/` - 認証関連コンポーネントを削除
- `app/auth/` - 認証ページを削除
- `lib/server/require-user-in-server-component.ts` - 削除

#### 2.3 i18nの実装

- `lib/i18n/settings.ts` - 設定（既存を修正）
- `lib/i18n/server.ts` - サーバーサイド実装（既存を修正）
- `lib/i18n/client.ts` - クライアントサイド実装（既存を修正）
- `lib/i18n/provider.tsx` - プロバイダーコンポーネント

#### 2.4 UIユーティリティの実装

- `lib/utils/cn.ts` - classNameマージ（tailwind-mergeを使用）
- `components/ui/if.tsx` - 条件付きレンダリングコンポーネント

### Phase 3: ファイルの移行

1. アプリケーションコードのコピー
2. 設定ファイルの調整
3. 依存関係の更新

### Phase 4: 設定ファイルの調整

1. `package.json` - 依存関係の更新
2. `tsconfig.json` - パスの調整
3. `next.config.mjs` - 設定の調整
4. `tailwind.config.ts` - 設定の調整（必要に応じて）

### Phase 5: テストと動作確認

1. ✅ ビルドの確認（完了）
2. [ ] 動作確認（開発サーバーでの確認が必要）
3. ✅ エラーの修正（完了）

## 新しいリポジトリ構造

```
circle/
├── app/                    # Next.js App Router
│   ├── [orgId]/           # チーム別ルーティング（認証不要）
│   └── layout.tsx          # 認証関連を削除
├── components/             # Reactコンポーネント
│   └── (auth関連を削除)
├── lib/                    # ユーティリティとヘルパー
│   ├── db/                 # SQLiteデータベース
│   │   ├── client.ts       # SQLiteクライアント
│   │   ├── schema.sql      # スキーマ定義
│   │   ├── migrations/      # マイグレーションファイル
│   │   └── types.ts        # 型定義
│   ├── i18n/               # i18n実装
│   └── utils/              # 汎用ユーティリティ
├── types/                  # TypeScript型定義
├── hooks/                  # React Hooks
├── actions/                # Server Actions（Supabase → SQLiteに変更）
├── config/                 # 設定ファイル
├── styles/                 # スタイルファイル
├── public/                 # 静的ファイル
├── database.sqlite         # SQLiteデータベースファイル
└── package.json
```

## 依存関係の置き換え表

| MakerKitパッケージ | 置き換え先 |
|-------------------|-----------|
| @kit/ui | shadcn/ui + 直接実装 |
| @kit/i18n | react-i18next + カスタム実装 |
| @kit/supabase | **削除 → better-sqlite3 + drizzle-orm** |
| @kit/auth | **削除（認証廃止）** |
| @kit/next | **削除（認証関連のみ）** |
| @kit/accounts | **削除（認証廃止）** |
| @kit/types | 既存のtypes/ディレクトリ |

## 新しい依存関係

### 追加するパッケージ
- `better-sqlite3` - SQLiteデータベースクライアント
- `drizzle-orm` - ORM（型安全なクエリビルダー）
- `drizzle-kit` - マイグレーション生成ツール

### 削除するパッケージ
- `@supabase/supabase-js`
- `@supabase/ssr`
- `@kit/*` すべて
- `@makerkit/*` すべて
- 認証関連のパッケージ

## 注意事項

1. **データベース**: SQLiteファイルは`database.sqlite`としてプロジェクトルートに配置
2. **i18n翻訳ファイル**: `public/locales/`の翻訳ファイルはそのまま移行
3. **環境変数**: Supabase関連の環境変数は不要（削除）
4. **認証**: すべての認証機能を削除し、誰でもアクセス可能にする
5. **ユーザー管理**: 認証がないため、ユーザーは単なるデータとして管理

## 実装状況

### 完了したフェーズ
- ✅ Phase 1: 準備と分析
- ✅ Phase 2: データベースと認証の置き換え
- ✅ Phase 3: ファイルの移行
- ✅ Phase 4: 設定ファイルの調整
- ✅ Phase 5: テストと動作確認（ビルドエラー修正完了）

### 残りの作業
- [ ] Phase 5.4: 動作確認（開発サーバーでの確認）
- [ ] Phase 5.6: シードデータの動作確認

## 次のステップ

1. ✅ この計画を確認（完了）
2. ✅ 新しいリポジトリの作成（完了）
3. ✅ Phase 2から順次実装（完了）
4. [ ] 開発サーバーでの動作確認
5. [ ] シードデータの動作確認

