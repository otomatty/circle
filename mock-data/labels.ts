export interface LabelInterface {
  id: string;
  name: string;
  color: string;
}

export const labels: LabelInterface[] = [
  { id: 'ui', name: 'UI改善', color: 'purple' },
  { id: 'bug', name: 'バグ修正', color: 'red' },
  { id: 'feature', name: '新機能', color: 'green' },
  { id: 'documentation', name: 'ドキュメント', color: 'blue' },
  { id: 'refactor', name: 'リファクタリング', color: 'yellow' },
  { id: 'performance', name: 'パフォーマンス', color: 'orange' },
  { id: 'design', name: 'デザイン', color: 'pink' },
  { id: 'security', name: 'セキュリティ', color: 'gray' },
  { id: 'accessibility', name: 'アクセシビリティ', color: 'indigo' },
  { id: 'testing', name: 'テスト', color: 'teal' },
  { id: 'internationalization', name: '国際化', color: 'cyan' },
];
