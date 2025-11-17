import { atom } from 'jotai';
import type { Status } from '~/types/status';

/**
 * ステータス情報を管理するアトム群
 */

// ステータスリストのアトム
export const statusesAtom = atom<Status[]>([]);

// ステータスカウント情報のアトム
export const statusCountsAtom = atom<Record<string, number>>({});
