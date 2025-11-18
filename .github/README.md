# GitHub設定

このディレクトリには、GitHubリポジトリの設定ファイルが含まれています。

## ファイル構成

- `workflows/branch-protection.yml`: ブランチ保護チェック用のGitHub Actionsワークフロー
- `PULL_REQUEST_TEMPLATE.md`: Pull Request作成時のテンプレート
- `CONTRIBUTING.md`: コントリビューションガイドライン
- `branch-protection-main.json`: mainブランチ保護設定（参考用）
- `branch-protection-develop.json`: developブランチ保護設定（参考用）

## ブランチ保護設定

### mainブランチ
- ✅ PR必須（直接push不可）
- ✅ developブランチからのPRのみマージ可能（GitHub Actionsでチェック）
- ✅ レビュー必須（設定により変更可能）

### developブランチ
- ✅ PR必須（直接push不可）
- ✅ 任意のブランチからのPRをマージ可能

## ブランチ保護設定の更新

ブランチ保護設定を更新する場合は、以下のコマンドを使用してください：

```bash
# mainブランチの保護設定を更新
gh api repos/otomatty/circle/branches/main/protection -X PUT --input .github/branch-protection-main.json

# developブランチの保護設定を更新
gh api repos/otomatty/circle/branches/develop/protection -X PUT --input .github/branch-protection-develop.json
```

## GitHub Actionsワークフロー

`branch-protection.yml`ワークフローは、以下のチェックを実行します：

1. **mainブランチへのPRチェック**: mainブランチへのPRは、developブランチからのみ許可されます
2. **PR要件の検証**: PRのタイトルと本文が空でないことを確認します

## 注意事項

- ブランチ保護設定は、GitHubのWeb UIからも確認・変更できます
- GitHub Actionsワークフローは、PRが作成・更新された際に自動的に実行されます
- ブランチ保護設定の変更は、リポジトリの管理者権限が必要です

