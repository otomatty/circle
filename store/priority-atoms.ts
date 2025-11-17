import { atom } from 'jotai';
import type { Priority } from '~/types/priorities';

/**
 * 優先度情報を管理するアトム群
 */

// 優先度リストのアトム
export const prioritiesAtom = atom<Priority[]>([]);
