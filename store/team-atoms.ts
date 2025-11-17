import { atom } from 'jotai';
import type { Team } from '~/types/teams';

/**
 * チームの状態を管理するatom
 */
export const teamsAtom = atom<Team[]>([]);
