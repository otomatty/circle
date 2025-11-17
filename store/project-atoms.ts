import { atom } from 'jotai';
import type { Project } from '~/types/projects';

/**
 * プロジェクト情報を管理するアトム群
 */

// プロジェクトリストのアトム
export const projectsAtom = atom<Project[]>([]);

// プロジェクトカウント情報のアトム
export const projectCountsAtom = atom<Record<string, number>>({});
