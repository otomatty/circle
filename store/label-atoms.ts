import { atom } from 'jotai';
import type { LabelInterface } from '~/types/labels';

/**
 * ラベル情報を管理するアトム群
 */

// ラベルリストのアトム
export const labelsAtom = atom<LabelInterface[]>([]);

// ラベルカウント情報のアトム
export const labelCountsAtom = atom<Record<string, number>>({});
