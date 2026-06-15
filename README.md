# Circle

Circleアプリケーションは、プロジェクト管理とタスク追跡のためのスタンドアロンアプリケーションです。

## 概要

Circle は **Cloudflare** をバックエンド基盤とする構成を採用しています。

- データベース: **Cloudflare D1**（SQLite）+ **Drizzle ORM**
- 認証: **Better Auth**（Google OAuth）
- ホスティング: **Cloudflare Workers / Pages**（`@opennextjs/cloudflare`）
- Google アカウントでログイン後、ユーザーが作成され、`CORE` チームに自動参加します

## 技術スタック

- **フレームワーク**: Next.js 15.2.3
- **データベース**: Cloudflare D1（SQLite）+ Drizzle ORM
- **認証**: Better Auth（Google OAuth）
- **ホスティング**: Cloudflare（`@opennextjs/cloudflare`）
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **状態管理**: Jotai
- **国際化**: i18next
- **パッケージマネージャー**: Bun

## セットアップ

### 前提条件

- Node.js 18以上 / Bun 1.2以上
- Cloudflare アカウント（D1 用）
- Google OAuth クライアント

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
| `BETTER_AUTH_SECRET` | Better Auth のシークレット（`openssl rand -base64 32`） |
| `BETTER_AUTH_URL` | 認証のベース URL（ローカルは `http://localhost:3000`） |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth クライアント |

### 3. D1 データベースの作成

```bash
bunx wrangler d1 create circle
```

出力された `database_id` を `wrangler.jsonc` の `d1_databases[0].database_id` に貼り付けてください。

### 4. マイグレーション

スキーマ（`lib/db/schema.ts`）から SQL を生成し、D1 に適用します。

```bash
bun run db:generate          # lib/db/schema.ts から SQL を生成
bun run db:migrate:local     # ローカル D1 に適用
bun run db:migrate:remote    # 本番 D1 に適用
```

### 5. シードデータ（参照データ）

```bash
bun run seed:d1              # ローカル D1 に投入
bun run seed:d1:remote       # 本番 D1 に投入
```

> ユーザーアカウントは初回 Google ログイン時に Better Auth が作成し、`CORE` チームに自動参加します。

### 6. Google 認証

1. Google Cloud Console で OAuth クライアントを作成
2. **承認済みリダイレクト URI** に追加:
   - `http://localhost:3000/api/auth/callback/google`（ローカル）
   - `https://<your-domain>/api/auth/callback/google`（本番）

### 7. 開発サーバー

```bash
bun run dev
```

`next.config.mjs` の `initOpenNextCloudflareForDev()` により、`next dev` でもローカル D1（`DB` バインディング）が利用できます。

## Cloudflare デプロイ

```bash
bun run cf:build
bun run cf:deploy
```

Cloudflare ダッシュボードで以下を **Secrets / Variables** に設定:

- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SITE_URL` / `BETTER_AUTH_URL`

D1 バインディングは `wrangler.jsonc` の `d1_databases` で設定済みです。

## スクリプト

| コマンド | 説明 |
|----------|------|
| `bun run dev` | 開発サーバー |
| `bun run build` | Next.js 本番ビルド |
| `bun run typecheck` | 型チェック |
| `bun run db:generate` | スキーマから D1 マイグレーション SQL を生成 |
| `bun run db:migrate:local` / `:remote` | D1 にマイグレーション適用 |
| `bun run seed:d1` / `:remote` | 参照データを D1 に投入 |
| `bun run seed:d1:sql` | シード SQL（`drizzle/seed.sql`）のみ生成 |
| `bun run cf:build` | Cloudflare 向け OpenNext ビルド |
| `bun run cf:deploy` | Cloudflare へデプロイ |

## プロジェクト構造

```
circle/
├── app/
│   ├── api/auth/[...all]/  # Better Auth ルートハンドラ
│   ├── auth/sign-in/       # ログイン
│   └── account/            # ユーザー設定
├── lib/
│   ├── auth.ts             # Better Auth 設定（D1 + Google）
│   ├── auth-client.ts      # ブラウザ用 auth クライアント
│   ├── auth-server.ts      # サーバー用セッションヘルパー
│   └── db/                 # Drizzle スキーマ・D1 クライアント
├── drizzle/migrations/     # D1 マイグレーション SQL
├── actions/                # Server Actions（Drizzle）
└── wrangler.jsonc          # Cloudflare 設定（D1 バインディング）
```

## ライセンス

（プロジェクトのライセンスに従う）
