# コントリビューションガイドライン

## ブランチ戦略

このプロジェクトでは、以下のブランチ戦略を使用しています。

### ブランチ構成

- **main**: 本番環境用ブランチ（保護設定あり）
- **develop**: 開発用ブランチ（保護設定あり）
- **feature/***: 機能追加用ブランチ
- **fix/***: バグ修正用ブランチ
- **hotfix/***: 緊急修正用ブランチ

### ブランチ保護ルール

#### mainブランチ
- ✅ PR必須（直接push不可）
- ✅ developブランチからのPRのみマージ可能
- ✅ レビュー必須（設定により変更可能）

#### developブランチ
- ✅ PR必須（直接push不可）
- ✅ 任意のブランチからのPRをマージ可能

### 作業フロー

1. **機能開発・バグ修正**
   ```bash
   # developブランチから作業ブランチを作成
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   
   # 作業を行う
   # ...
   
   # developブランチにPRを作成
   git push origin feature/your-feature-name
   ```

2. **本番リリース**
   ```bash
   # developブランチからmainブランチにPRを作成
   # GitHub上でdevelop → mainのPRを作成
   ```

3. **緊急修正（hotfix）**
   ```bash
   # developブランチからhotfixブランチを作成
   git checkout develop
   git pull origin develop
   git checkout -b hotfix/your-hotfix-name
   
   # 修正を行う
   # ...
   
   # developブランチにPRを作成（承認後、mainへリリース）
   git push origin hotfix/your-hotfix-name
   ```
   
   **hotfix後の手順:**
   ```bash
   # developブランチへのPRがマージされた後
   # GitHub上でdevelop → mainのPRを作成してリリース
   
   # または、ローカルでmainブランチにマージする場合
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   
   # その後、developブランチも最新の状態に保つ（通常は自動的に同期される）
   ```

### PR作成時の注意事項

- PRのタイトルは明確に変更内容を表すものにしてください
- PRの説明には、変更内容、関連Issue、テスト結果などを記載してください
- レビューが完了するまでマージしないでください
- mainブランチへのPRは、必ずdevelopブランチから作成してください

### コミットメッセージ

コミットメッセージは以下の形式に従ってください：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**例:**
```
feat(migration): add database migration system

- Implement migration management system
- Add migration scripts
- Add rollback functionality

Closes #1
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更（動作に影響しない）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセスやツールの変更

