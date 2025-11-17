import { atom } from 'jotai';
import type { User } from '~/types/users';

/**
 * ユーザー情報を管理するアトム群
 */

// ユーザーリストのアトム
export const usersAtom = atom<User[]>([]);

// 担当者カウント情報のアトム
export const assigneeCountsAtom = atom<Record<string, number>>({});
