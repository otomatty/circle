import type { EstimateFormData } from '~/types/estimate';
import type { FeatureProposal } from '~/types/estimate';

export function generateFeaturePrompt(formData: EstimateFormData) {
  return `
あなたはWeb開発の専門家です。以下のプロジェクトに必要な機能を可能な限り多く提案してください。
基本機能から発展的な機能まで、プロジェクトの価値を高める可能性のある機能を幅広く検討してください。

プロジェクトの種類: ${formData.projectType === 'web' ? 'Webサイト' : formData.projectType === 'app' ? 'Webアプリケーション' : 'その他'}
プロジェクトの概要: ${formData.description}
希望納期: ${
    formData.deadline === 'asap'
      ? 'できるだけ早く'
      : formData.deadline === '1month'
        ? '1ヶ月以内'
        : formData.deadline === '3months'
          ? '3ヶ月以内'
          : formData.deadline === '6months'
            ? '6ヶ月以内'
            : '柔軟に対応可能'
  }

以下の形式でJSONを返してください。Markdownのコードブロックは使用せず、純粋なJSONのみを返してください：

{
  "features": [
    {
      "id": "一意のID",
      "name": "機能名",
      "description": "機能の説明",
      "category": "core" | "user" | "auth" | "content" | "payment" | "other",
      "dependencies": ["依存する機能のID"]
    }
  ]
}

注意事項：
- プロジェクトの目的達成に必要な基本機能を必ず含めてください
- ユーザー体験を向上させる付加機能も積極的に提案してください
- 将来的な拡張性を考慮した機能も検討してください
- 機能間の依存関係を明確にしてください
- カテゴリは以下の基準で分類してください：
  - core: システムの中核となる基本機能
  - user: ユーザー管理、プロフィール関連機能
  - auth: 認証、認可関連機能
  - content: コンテンツ管理、投稿関連機能
  - payment: 決済関連機能
  - other: その他の機能
- 回答は必ず有効なJSON形式で返してください。説明文やMarkdownは含めないでください。
`.trim();
}

export function generateRequiredFeaturesPrompt(features: FeatureProposal[]) {
  return `
あなたはWeb開発の専門家です。以下の機能リストを分析し、プロジェクトの実現に本当に必要な機能のみを必須機能として選定してください。
機能の選定は非常に厳密に行い、その機能がなくてもプロジェクトの基本的な目的が達成できる場合は、任意機能として判断してください。

以下の機能リストについて、各機能の必要性を厳密に判断してください：

${JSON.stringify(features, null, 2)}

以下の形式でJSONを返してください。Markdownのコードブロックは使用せず、純粋なJSONのみを返してください：

{
  "features": [
    {
      "id": "元の機能ID",
      "isRequired": true/false,
      "reason": "必須/任意と判断した理由の説明"
    }
  ]
}

判断基準：
- その機能がなければプロジェクトの基本的な目的が達成できない場合のみ必須とする
- 「あったら便利」程度の機能は必ず任意とする
- ユーザー体験の向上のみを目的とした機能は任意とする
- 将来的な拡張性のための機能は任意とする
- 代替手段が存在する機能は任意とする
- 回答は必ず有効なJSON形式で返してください。説明文やMarkdownは含めないでください。
`.trim();
}

export function generateEstimationPrompt(features: FeatureProposal[]) {
  return `
あなたはWeb開発の専門家です。以下の機能リストについて、各機能の実装難易度を評価し、開発期間と費用を見積もってください。

以下の機能リストについて、各機能の実装難易度を評価し、それに基づいて開発期間と費用を算出してください：

${JSON.stringify(features, null, 2)}

以下の形式でJSONを返してください。Markdownのコードブロックは使用せず、純粋なJSONのみを返してください：

{
  "features": [
    {
      "id": "元の機能ID",
      "difficulty": 1-5の整数（1: 最も簡単、5: 最も難しい）,
      "duration": 開発期間（日数、少数第一位まで）,
      "dailyRate": 1日あたりの単価（円）,
      "price": 開発費用（円）,
      "difficultyReason": "難易度の判断理由"
    }
  ]
}

見積もり基準：
- 実装難易度は以下の基準で5段階評価してください：
  1: 非常に簡単な実装（定型的なCRUD操作など）
  2: 比較的簡単な実装（基本的なフォーム処理など）
  3: 標準的な実装（一般的な認証機能など）
  4: やや複雑な実装（高度な検索機能、複雑な状態管理など）
  5: 非常に複雑な実装（リアルタイム処理、複雑なアルゴリズムなど）

- 1日あたりの単価は実装難易度に応じて以下の範囲で設定してください：
  難易度1: 20,000円
  難易度2: 27,500円
  難易度3: 35,000円
  難易度4: 42,500円
  難易度5: 50,000円

- 開発費用は以下の計算式で算出してください：
  開発費用 = 開発期間（日） × 1日あたりの単価（円）
- 回答は必ず有効なJSON形式で返してください。説明文やMarkdownは含めないでください。
`.trim();
}
