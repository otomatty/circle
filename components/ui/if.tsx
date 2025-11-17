/**
 * If.tsx
 *
 * 条件付きレンダリングコンポーネント
 * 条件がtrueの場合のみ子要素をレンダリングします
 */

interface IfProps {
  condition: boolean;
  children: React.ReactNode;
}

/**
 * 条件付きレンダリングコンポーネント
 *
 * @param condition - レンダリング条件
 * @param children - レンダリングする子要素
 * @returns 条件がtrueの場合は子要素、falseの場合はnull
 */
export function If({ condition, children }: IfProps) {
  if (!condition) {
    return null;
  }

  return <>{children}</>;
}

