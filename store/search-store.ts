import { atom } from 'jotai';

/**
 * @description 検索 UI が開いているかどうかを示す Atom。
 */
export const isSearchOpenAtom = atom<boolean>(false);

/**
 * @description 現在の検索クエリ文字列を示す Atom。
 */
export const searchQueryAtom = atom<string>('');

// --- Actions --- (using write-only atoms)

/**
 * @description 検索 UI を開くための Atom。
 */
export const openSearchAtom = atom(null, (get, set) => {
  set(isSearchOpenAtom, true);
});

/**
 * @description 検索 UI を閉じるための Atom。
 */
export const closeSearchAtom = atom(null, (get, set) => {
  set(isSearchOpenAtom, false);
});

/**
 * @description 検索 UI の表示/非表示を切り替えるための Atom。
 */
export const toggleSearchAtom = atom(null, (get, set) => {
  set(isSearchOpenAtom, (prev) => !prev);
});

/**
 * @description 検索クエリを設定するための Atom。
 */
export const setSearchQueryAtom = atom(null, (get, set, query: string) => {
  set(searchQueryAtom, query);
});

/**
 * @description 検索状態をリセット（UI を閉じ、クエリをクリア）するための Atom。
 */
export const resetSearchAtom = atom(null, (get, set) => {
  set(isSearchOpenAtom, false);
  set(searchQueryAtom, '');
});
