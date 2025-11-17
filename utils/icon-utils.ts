import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * アイコン名（文字列）からLucideアイコンコンポーネントを取得する関数
 */
export function getIconFromString(
  iconName: string | undefined | null
): LucideIcon {
  // iconNameが'undefined'や空文字、nullの場合はデフォルトアイコンを返す
  if (!iconName || iconName === 'undefined') {
    return LucideIcons.CircleDot;
  }

  try {
    // 文字列型であることを確認し、空文字をデフォルト値に
    const iconStr = typeof iconName === 'string' ? iconName : '';

    // アイコン名を正規化（キャメルケースに変換）
    const normalizedIconName = iconStr
      .replace(/-([a-z])/g, (g) => g.toUpperCase())
      .replace(/^[a-z]/, (g) => g.toUpperCase());

    // LucideIconsからアイコンコンポーネントを取得
    // 型安全に処理するため、anyを使用
    const LucideIconsAny = LucideIcons as unknown as Record<string, LucideIcon>;
    const IconComponent = LucideIconsAny[normalizedIconName] as
      | LucideIcon
      | undefined;

    // 対応するアイコンが見つからない場合はデフォルトアイコンを返す
    if (!IconComponent) {
      console.warn(`Icon "${iconName}" not found, using default icon instead.`);
      return LucideIcons.CircleDot;
    }

    return IconComponent;
  } catch (error) {
    console.error(`Error processing icon name: ${iconName}`, error);
    return LucideIcons.CircleDot;
  }
}
