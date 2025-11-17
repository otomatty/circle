import { atom } from 'jotai';

export type ViewType = 'list' | 'grid';

/**
 * @description 現在のビュータイプ（リスト表示 or グリッド表示）を示す Atom。
 */
export const viewTypeAtom = atom<ViewType>('list');

/**
 * @description ビュータイプを設定するための書き込み専用 Atom。
 */
export const setViewTypeAtom = atom(null, (get, set, viewType: ViewType) => {
  set(viewTypeAtom, viewType);
});
