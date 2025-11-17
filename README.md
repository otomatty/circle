# Circle

Circleアプリケーションは、プロジェクト管理とタスク追跡のためのスタンドアロンアプリケーションです。

## 概要

Circleは、MakerKit依存から独立し、SQLiteデータベースを使用するスタンドアロンアプリケーションとして再構築されました。認証機能は廃止され、誰でもアクセス可能なアプリケーションとなっています。

## 技術スタック

- **フレームワーク**: Next.js 15.2.3
- **データベース**: SQLite (better-sqlite3)
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **状態管理**: Jotai
- **国際化**: i18next
- **パッケージマネージャー**: Bun

## セットアップ

### 前提条件

- Node.js 18以上
- Bun 1.2以上

### インストール

1. リポジトリをクローンします：

```bash
git clone <repository-url>
cd circle
```

2. 依存関係をインストールします：

```bash
bun install
```

3. 環境変数を設定します：

```bash
cp .env.example .env.local
```

`.env.local`ファイルを編集し、必要な環境変数を設定してください。

4. データベースを初期化します：

```bash
bun run db:init
```

5. （オプション）シードデータを挿入します：

```bash
bun run seed:database
```

### 開発サーバーの起動

```bash
bun run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

## スクリプト

- `bun run dev` - 開発サーバーを起動
- `bun run build` - 本番用ビルドを作成
- `bun run start` - 本番サーバーを起動
- `bun run lint` - リンターを実行
- `bun run format` - コードをフォーマット
- `bun run typecheck` - TypeScriptの型チェックを実行
- `bun run db:init` - データベースを初期化
- `bun run seed:database` - シードデータを挿入

## プロジェクト構造

```
circle/
├── app/                    # Next.js App Router
├── components/             # Reactコンポーネント
│   └── ui/                # shadcn/uiコンポーネント
├── lib/                    # ユーティリティとヘルパー
│   ├── db/                # SQLiteデータベース
│   └── i18n/              # i18n実装
├── actions/               # Server Actions
├── store/                 # Jotaiストア
├── types/                 # TypeScript型定義
├── hooks/                 # React Hooks
├── config/                # 設定ファイル
├── mock-data/             # モックデータ
├── scripts/               # スクリプト
└── public/                # 静的ファイル
```

## データベース

SQLiteデータベースは`database.sqlite`としてプロジェクトルートに作成されます。このファイルは`.gitignore`に含まれているため、リポジトリにはコミットされません。

### スキーマ

データベーススキーマは`lib/db/schema.sql`で定義されています。主なテーブル：

- `statuses` - ステータス
- `priorities` - 優先度
- `labels` - ラベル
- `users` - ユーザー
- `teams` - チーム
- `team_members` - チームメンバー
- `projects` - プロジェクト
- `issues` - タスク（イシュー）

## 環境変数

必要な環境変数については`.env.example`を参照してください。

## ライセンス

[ライセンス情報を追加]
