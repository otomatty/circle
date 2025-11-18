# VSCode設定

このディレクトリには、VSCodeのワークスペース設定が含まれています。

## 設定ファイル

- `settings.json`: VSCodeのワークスペース設定
- `extensions.json`: 推奨拡張機能のリスト

## Git設定

### ブランチ保護
VSCodeの設定で、以下のブランチが保護されています：
- `main`
- `develop`

これらのブランチへの直接コミットは、Gitのpre-commitフックによって防止されます。

### Git Hooksのセットアップ

プロジェクトのルートディレクトリで以下のコマンドを実行して、Git hooksをセットアップしてください：

```bash
bun run setup:git-hooks
```

または、直接実行：

```bash
./scripts/setup-git-hooks.sh
```

## 推奨拡張機能

以下の拡張機能が推奨されています：

- **GitLens**: Gitの可視化と操作を強化
- **GitHub Pull Requests**: GitHubのPRをVSCode内で操作
- **GitHub Copilot**: AIによるコード補完
- **GitHub Copilot Chat**: AIによるコードチャット

## 注意事項

- Git hooksは、`.git/hooks/`ディレクトリに配置されます
- Git hooksは、リポジトリにコミットされません（`.gitignore`で除外されています）
- 新しい環境で作業を開始する際は、`setup:git-hooks`スクリプトを実行してください

