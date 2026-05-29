# Circle

Circleアプリケーションは、プロジェクト管理とタスク追跡のためのスタンドアロンアプリケーションです。

## 概要

Circle は **Supabase**（PostgreSQL + Google 認証）をバックエンドとし、フロントエンドを **Cloudflare Pages**（OpenNext）へデプロイする構成を採用しています。

- Google アカウントでログイン
- ログイン後、`profiles` とチームメンバーシップが自動作成
- チーム・プロジェクト・ステータス等は Supabase に保存

## 技術スタック

- **フレームワーク**: Next.js 15.2.3
- **データベース / 認証**: Supabase（PostgreSQL + Auth）
- **ホスティング**: Cloudflare Pages（`@opennextjs/cloudflare`）
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **状態管理**: Jotai（課題 UI は引き続きクライアント状態）
- **国際化**: i18next
- **パッケージマネージャー**: Bun

## セットアップ

### 前提条件

- Node.js 18以上
- Bun 1.2以上
- Supabase プロジェクト
- Google OAuth クライアント（Supabase Auth 用）

### 1. インストール

```bash
git clone <repository-url>
cd circle
bun install
```

### 2. 環境変数

```bash
cp .env.example .env.local
```

| 変数 | 説明 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | アプリの公開 URL（例: `http://localhost:3000`） |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | シードスクリプト用（サーバーのみ） |

### 3. Supabase マイグレーション

Supabase Dashboard の SQL Editor、または Supabase CLI で `supabase/migrations/` 内の SQL を順に実行してください。

### 4. Google 認証（Supabase）

1. Supabase Dashboard → **Authentication → Providers → Google** を有効化
2. Google Cloud Console で OAuth クライアントを作成
3. **Redirect URLs** に追加:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`（ローカル）
   - 本番: `https://<your-domain>/auth/callback`

### 5. シードデータ

```bash
bun run seed:supabase
```

### 6. 開発サーバー

```bash
bun run dev
```

[http://localhost:3000](http://localhost:3000) で Google ログイン後に利用できます。

## Cloudflare Pages デプロイ

```bash
bun run cf:build
bun run cf:deploy
```

Cloudflare ダッシュボードで以下を **Secrets / Environment variables** に設定:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

詳細は [`docs/03_plans/supabase-cloudflare/20260529_01_supabase-auth-cloudflare.md`](docs/03_plans/supabase-cloudflare/20260529_01_supabase-auth-cloudflare.md) を参照してください。

## スクリプト

| コマンド | 説明 |
|----------|------|
| `bun run dev` | 開発サーバー |
| `bun run build` | Next.js 本番ビルド |
| `bun run typecheck` | 型チェック |
| `bun run seed:supabase` | Supabase に参照データを投入 |
| `bun run cf:build` | Cloudflare 向け OpenNext ビルド |
| `bun run cf:deploy` | Cloudflare Pages へデプロイ |
| `bun run db:init` | （レガシー）ローカル SQLite 初期化 |
| `bun run seed:database` | （レガシー）SQLite シード |

## プロジェクト構造

```
circle/
├── app/
│   ├── auth/              # ログイン・OAuth コールバック
│   └── account/           # ユーザー設定
├── lib/supabase/          # Supabase クライアント・認証
├── supabase/migrations/   # PostgreSQL スキーマ・RLS
├── actions/               # Server Actions
└── ...
```

## ライセンス

（プロジェクトのライセンスに従う）
