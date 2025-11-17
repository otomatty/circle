import type { EstimateFormData } from '~/types/estimate';

export function generateQuestionPrompt(formData: EstimateFormData) {
  return `
あなたはWeb開発の専門家です。以下のプロジェクトについて、見積もりの精度を高めるために必要な質問を生成してください。
ただし、質問は技術的な専門用語を避け、非エンジニアのクライアントにも理解しやすい平易な言葉で表現してください。

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

以下の形式でJSONを返してください：

{
  "questions": [
    {
      "id": "一意のID",
      "question": "質問文",
      "type": "text" | "radio",
      "options": ["選択肢1", "選択肢2"], // typeがradioの場合のみ
      "description": "この質問の意図や補足説明" // 質問の意図を説明する文章
    }
  ]
}

注意事項：
- 専門用語を避け、一般的なビジネスパーソンにも理解できる言葉を使用してください
- 具体例を含めて質問の意図が伝わりやすいようにしてください
- 予算、デザイン要件、運用方法など、見積もりに影響する重要な質問を含めてください
- 質問は3-5個程度に抑えてください
- 質問の種類は text（自由記述）か radio（選択式）のいずれかにしてください
`.trim();
}
