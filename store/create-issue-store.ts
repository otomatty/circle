import { atom } from 'jotai';
import type { Status } from '~/types/status';

/**
 * @description 「Issue 作成モーダル」が開いているかどうかを示す Atom。
 */
export const isCreateIssueModalOpenAtom = atom<boolean>(false);

/**
 * @description モーダルを開く際にデフォルトで選択されるステータスを示す Atom。
 */
export const defaultCreateIssueStatusAtom = atom<Status | null>(null);

// --- Actions --- (using write-only atoms)

/**
 * @description Issue 作成モーダルを開くための Atom。
 *              オプションでデフォルトのステータスを受け取ることができます。
 */
export const openCreateIssueModalAtom = atom(
  null, // Read part is not used
  (get, set, status?: Status) => {
    set(isCreateIssueModalOpenAtom, true);
    set(defaultCreateIssueStatusAtom, status || null);
  }
);

/**
 * @description Issue 作成モーダルを閉じるための Atom。
 */
export const closeCreateIssueModalAtom = atom(null, (get, set) => {
  set(isCreateIssueModalOpenAtom, false);
  // Optionally reset default status when closing
  // set(defaultCreateIssueStatusAtom, null);
});

/**
 * @description モーダルのデフォルトステータスを設定するための Atom。
 *              主にモーダルが開いている間に内部的に使用されることを想定。
 */
export const setModalDefaultStatusAtom = atom(
  null,
  (get, set, status: Status | null) => {
    set(defaultCreateIssueStatusAtom, status);
  }
);
