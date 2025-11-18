# VSCodeブランチ保護設定

## 作成日
2025年11月17日

## 概要
VSCodeとGitフックを使用して、mainブランチとdevelopブランチへの直接コミットを防止する設定を追加しました。

## 実装内容

### 1. Git Pre-commitフック
- **ファイル**: `.git/hooks/pre-commit`
- **機能**: mainブランチとdevelopブランチへの直接コミットをブロック
- **動作**: コミット実行時にブランチ名をチェックし、保護されたブランチの場合はエラーを表示

### 2. Git Hooksセットアップスクリプト
- **ファイル**: `scripts/setup-git-hooks.sh`
- **機能**: Gitフックを自動的にセットアップ
- **実行方法**: `bun run setup:git-hooks`

### 3. VSCode設定
- **ファイル**: `.vscode/settings.json`
- **設定内容**:
  - Git関連の設定
  - ブランチ保護の設定（将来の拡張機能対応）
  - Force pushの無効化

### 4. VSCode推奨拡張機能
- **ファイル**: `.vscode/extensions.json`
- **推奨拡張機能**:
  - GitLens
  - GitHub Pull Requests
  - GitHub Copilot
  - GitHub Copilot Chat

## 使用方法

### 初回セットアップ
新しい環境でリポジトリをクローンした後、以下のコマンドを実行してください：

```bash
bun run setup:git-hooks
```

### 動作確認
保護されたブランチ（main/develop）にコミットしようとすると、以下のエラーが表示されます：

```
❌ Error: Direct commits to 'main' branch are not allowed.

Please create a feature branch and submit a pull request:
  git checkout -b feature/your-feature-name

Protected branches: main develop
```

### 正しい作業フロー
1. 作業ブランチを作成
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. 変更をコミット
   ```bash
   git add .
   git commit -m "feat: your changes"
   ```

3. PRを作成
   ```bash
   git push origin feature/your-feature-name
   # GitHub上でPRを作成
   ```

## 保護されたブランチ
- `main`: 本番環境用ブランチ
- `develop`: 開発用ブランチ

## 注意事項
- Gitフックは`.git/hooks/`ディレクトリに配置されますが、リポジトリにはコミットされません
- 新しい環境で作業を開始する際は、必ず`setup:git-hooks`スクリプトを実行してください
- Gitフックは、VSCodeだけでなく、すべてのGit操作（コマンドライン、IDEなど）から保護します

## 関連ファイル
- `.git/hooks/pre-commit`: Git pre-commitフック
- `scripts/setup-git-hooks.sh`: セットアップスクリプト
- `.vscode/settings.json`: VSCode設定
- `.vscode/extensions.json`: 推奨拡張機能
- `.vscode/README.md`: VSCode設定の説明

