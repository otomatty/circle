# Supabase 認証 + Cloudflare デプロイ実装計画

## 作成日
2026年5月29日

## 概要

Circle を **Supabase（Google 認証 + PostgreSQL）** と **Cloudflare Pages（OpenNext）** で運用するための基盤を実装する。

## 完了項目

- [x] Supabase マイグレーション（`profiles` + アプリテーブル + RLS）
- [x] Google OAuth（`/auth/sign-in`, `/auth/callback`）
- [x] ミドルウェアによるセッション更新・ルート保護
- [x] Server Actions の Supabase 移行
- [x] ユーザープロフィール（`/account`）
- [x] Cloudflare OpenNext 設定（`wrangler.jsonc`, `open-next.config.ts`）
- [x] シードスクリプト `bun run seed:supabase`

## 未完了・フォローアップ

- [ ] 課題 CRUD の DB 永続化（現状 Jotai + mock のまま）
- [ ] チーム単位 RLS の厳格化
- [ ] メンバー招待フロー
- [ ] `supabase gen types` による型自動生成
- [ ] E2E テスト（認証フロー）

## セットアップ手順

### 1. Supabase プロジェクト

1. [Supabase Dashboard](https://supabase.com/dashboard) でプロジェクト作成
2. **Authentication → Providers → Google** を有効化（Client ID / Secret）
3. **Redirect URLs** に以下を追加:
   - `http://localhost:3000/auth/callback`
   - `https://<your-pages-domain>/auth/callback`
4. SQL Editor または CLI で `supabase/migrations/*.sql` を適用

### 2. 環境変数

`.env.example` を `.env.local` にコピーし、値を設定。

### 3. シード

```bash
bun run seed:supabase
```

### 4. 開発

```bash
bun run dev
```

### 5. Cloudflare Pages

```bash
bun run cf:build
bun run cf:deploy
```

Cloudflare ダッシュボードで `NEXT_PUBLIC_SUPABASE_*` 等のシークレットを設定する。
