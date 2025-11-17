import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils'; // パラメータ付きatomのために追加
import { issues as mockIssues } from '../mock-data/issues'; // Issue と groupIssuesByStatus を削除
import type { Issue } from '~/types/issues'; // Issue のインポート元を変更
import { groupIssuesByStatus } from '~/utils/issue-utils'; // groupIssuesByStatus のインポート元を変更
import type { LabelInterface } from '../types/labels';
import type { Priority } from '../types/priorities';
import type { Project } from '../types/projects';
import type { Status } from '../types/status';
import type { User } from '../types/users';

// --- Base Atoms ---

/**
 * @description すべての Issue データを含む Atom。
 *              初期値はモックデータから取得し、rank で降順ソートされます。
 */
export const issuesAtom = atom<Issue[]>(
  mockIssues.sort((a, b) => b.rank.localeCompare(a.rank))
);

/**
 * @description issuesAtom から派生し、ステータスごとに Issue をグループ化する Atom。
 */
export const issuesByStatusAtom = atom((get) => {
  const issues = get(issuesAtom);
  return groupIssuesByStatus(issues);
});

// --- Writeable Atoms / Actions ---

/**
 * @description 新しい Issue を Issue リストに追加するための Atom。
 *              書き込み関数は新しい Issue オブジェクトを受け取ります。
 */
export const addIssueAtom = atom(null, (get, set, newIssue: Issue) => {
  const currentIssues = get(issuesAtom);
  // 新しい Issue を追加し、rank でソートし直す
  const updatedIssues = [...currentIssues, newIssue].sort((a, b) =>
    b.rank.localeCompare(a.rank)
  );
  set(issuesAtom, updatedIssues);
  // issuesByStatusAtom は issuesAtom に依存しているため自動的に更新される
});

/**
 * @description 既存の Issue を更新するための Atom。
 *              書き込み関数は Issue の ID と更新データ (Partial<Issue>) を含むオブジェクトを受け取ります。
 */
export const updateIssueAtom = atom(
  null,
  (
    get,
    set,
    { id, updatedIssueData }: { id: string; updatedIssueData: Partial<Issue> }
  ) => {
    const currentIssues = get(issuesAtom);
    const updatedIssues = currentIssues.map((issue) =>
      issue.id === id ? { ...issue, ...updatedIssueData } : issue
    );
    set(issuesAtom, updatedIssues);
    // issuesByStatusAtom も同様に自動更新される
  }
);

/**
 * @description Issue を ID に基づいて削除するための Atom。
 *              書き込み関数は削除する Issue の ID を受け取ります。
 */
export const deleteIssueAtom = atom(null, (get, set, id: string) => {
  const currentIssues = get(issuesAtom);
  const updatedIssues = currentIssues.filter((issue) => issue.id !== id);
  set(issuesAtom, updatedIssues);
});

/**
 * @description Issue のステータスを更新するための Atom。
 *              書き込み関数は Issue の ID と新しい Status オブジェクトを受け取ります。
 */
export const updateIssueStatusAtom = atom(
  null,
  (
    get,
    set,
    { issueId, newStatus }: { issueId: string; newStatus: Status }
  ) => {
    // 内部で updateIssueAtom を呼び出す
    set(updateIssueAtom, {
      id: issueId,
      updatedIssueData: { status: newStatus },
    });
  }
);

/**
 * @description Issue の優先度を更新するための Atom。
 *              書き込み関数は Issue の ID と新しい Priority オブジェクトを受け取ります。
 */
export const updateIssuePriorityAtom = atom(
  null,
  (
    get,
    set,
    { issueId, newPriority }: { issueId: string; newPriority: Priority }
  ) => {
    set(updateIssueAtom, {
      id: issueId,
      updatedIssueData: { priority: newPriority },
    });
  }
);

/**
 * @description Issue の担当者を更新するための Atom。
 *              書き込み関数は Issue の ID と新しい User オブジェクト (または null) を受け取ります。
 */
export const updateIssueAssigneeAtom = atom(
  null,
  (
    get,
    set,
    { issueId, newAssignee }: { issueId: string; newAssignee: User | null }
  ) => {
    set(updateIssueAtom, {
      id: issueId,
      updatedIssueData: { assignees: newAssignee },
    });
  }
);

/**
 * @description Issue にラベルを追加するための Atom。
 *              書き込み関数は Issue ID と追加する Label オブジェクトを受け取ります。
 */
export const addIssueLabelAtom = atom(
  null,
  (
    get,
    set,
    { issueId, label }: { issueId: string; label: LabelInterface }
  ) => {
    const issue = get(issueByIdAtom(issueId)); // Get the specific issue
    if (issue && !issue.labels.some((l) => l.id === label.id)) {
      // Avoid duplicates
      const updatedLabels = [...issue.labels, label];
      set(updateIssueAtom, {
        id: issueId,
        updatedIssueData: { labels: updatedLabels },
      });
    }
  }
);

/**
 * @description Issue からラベルを削除するための Atom。
 *              書き込み関数は Issue ID と削除する Label の ID を受け取ります。
 */
export const removeIssueLabelAtom = atom(
  null,
  (get, set, { issueId, labelId }: { issueId: string; labelId: string }) => {
    const issue = get(issueByIdAtom(issueId));
    if (issue) {
      const updatedLabels = issue.labels.filter(
        (label) => label.id !== labelId
      );
      set(updateIssueAtom, {
        id: issueId,
        updatedIssueData: { labels: updatedLabels },
      });
    }
  }
);

/**
 * @description Issue のプロジェクトを更新するための Atom。
 *              書き込み関数は Issue ID と新しい Project オブジェクト (または undefined) を受け取ります。
 */
export const updateIssueProjectAtom = atom(
  null,
  (
    get,
    set,
    {
      issueId,
      newProject,
    }: { issueId: string; newProject: Project | undefined }
  ) => {
    set(updateIssueAtom, {
      id: issueId,
      updatedIssueData: { project: newProject },
    });
  }
);

// --- Selector Atoms (using atomFamily or derived atoms) ---

/**
 * @description ステータス ID に基づいて Issue をフィルタリングする Atom Family。
 */
export const issuesFilteredByStatusAtom = atomFamily((statusId: string) =>
  atom((get) => get(issuesAtom).filter((issue) => issue.status.id === statusId))
);

/**
 * @description 優先度 ID に基づいて Issue をフィルタリングする Atom Family。
 */
export const issuesFilteredByPriorityAtom = atomFamily((priorityId: string) =>
  atom((get) =>
    get(issuesAtom).filter((issue) => issue.priority.id === priorityId)
  )
);

/**
 * @description 担当者 ID (または null) に基づいて Issue をフィルタリングする Atom Family。
 */
export const issuesFilteredByAssigneeAtom = atomFamily(
  (userId: string | null) =>
    atom((get) => {
      if (userId === null) {
        // 担当者が割り当てられていない Issue をフィルタリング
        return get(issuesAtom).filter((issue) => issue.assignees === null);
      }
      // 特定の担当者が割り当てられている Issue をフィルタリング
      return get(issuesAtom).filter((issue) => issue.assignees?.id === userId);
    })
);

/**
 * @description ラベル ID に基づいて Issue をフィルタリングする Atom Family。
 */
export const issuesFilteredByLabelAtom = atomFamily((labelId: string) =>
  atom((get) =>
    get(issuesAtom).filter((issue) =>
      issue.labels.some((label) => label.id === labelId)
    )
  )
);

/**
 * @description プロジェクト ID に基づいて Issue をフィルタリングする Atom Family。
 */
export const issuesFilteredByProjectAtom = atomFamily((projectId: string) =>
  atom((get) =>
    get(issuesAtom).filter((issue) => issue.project?.id === projectId)
  )
);

/**
 * @description 検索クエリに基づいて Issue をフィルタリングする Atom Family。
 *              タイトルまたは識別子にクエリ文字列が含まれる Issue を返します (大文字小文字区別なし)。
 *              クエリが空の場合はすべての Issue を返します。
 */
export const searchedIssuesAtom = atomFamily((query: string) =>
  atom((get) => {
    const allIssues = get(issuesAtom);
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return allIssues; // クエリが空なら全て返す
    }

    return allIssues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(normalizedQuery) ||
        issue.identifier.toLowerCase().includes(normalizedQuery)
    );
  })
);

// --- Count Atoms ---

/**
 * @description ステータスごとの Issue 数を計算する Atom。
 */
export const statusCountsAtom = atom((get) => {
  const issues = get(issuesAtom);
  const counts: { [statusId: string]: number } = {};
  for (const issue of issues) {
    counts[issue.status.id] = (counts[issue.status.id] || 0) + 1;
  }
  return counts;
});

/**
 * @description 優先度ごとの Issue 数を計算する Atom。
 */
export const priorityCountsAtom = atom((get) => {
  const issues = get(issuesAtom);
  const counts: { [priorityId: string]: number } = {};
  for (const issue of issues) {
    counts[issue.priority.id] = (counts[issue.priority.id] || 0) + 1;
  }
  return counts;
});

/**
 * @description 担当者ごとの Issue 数を計算する Atom ('unassigned' キーを含む)。
 */
export const assigneeCountsAtom = atom((get) => {
  const issues = get(issuesAtom);
  const counts: { [assigneeId: string]: number } = {};
  for (const issue of issues) {
    const assigneeId = issue.assignees?.id ?? 'unassigned';
    counts[assigneeId] = (counts[assigneeId] || 0) + 1;
  }
  return counts;
});

/**
 * @description プロジェクトごとの Issue 数を計算する Atom ('no-project' キーを含む)。
 */
export const projectCountsAtom = atom((get) => {
  const issues = get(issuesAtom);
  const counts: { [projectId: string]: number } = {};
  for (const issue of issues) {
    const projectId = issue.project?.id ?? 'no-project';
    counts[projectId] = (counts[projectId] || 0) + 1;
  }
  return counts;
});

/**
 * @description ラベルごとの Issue 数を計算する Atom。
 *              (1つの Issue が複数のラベルを持つため、各ラベルに対してカウント)
 */
export const labelCountsAtom = atom((get) => {
  const issues = get(issuesAtom);
  const counts: { [labelId: string]: number } = {};
  for (const issue of issues) {
    for (const label of issue.labels) {
      counts[label.id] = (counts[label.id] || 0) + 1;
    }
  }
  return counts;
});

// --- Utility Atoms ---

/**
 * @description Issue ID に基づいて特定の Issue を取得する Atom Family。
 *              指定された ID の Issue が見つからない場合は undefined を返します。
 */
export const issueByIdAtom = atomFamily((id: string | undefined) =>
  atom((get) => {
    if (!id) return undefined; // ID が指定されていない場合は undefined を返す
    return get(issuesAtom).find((issue) => issue.id === id);
  })
);

// getAllIssues is simply reading the base issuesAtom: `useAtomValue(issuesAtom)` in components
