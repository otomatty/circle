/**
 * cn.ts
 *
 * classNameマージユーティリティ
 * tailwind-mergeを使用してTailwind CSSクラスをマージします
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * classNameをマージする関数
 * clsxとtailwind-mergeを組み合わせて使用します
 *
 * @param inputs - マージするクラス名（文字列、オブジェクト、配列など）
 * @returns マージされたクラス名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

