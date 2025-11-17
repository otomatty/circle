'use client';

import { useAtomValue } from 'jotai';
import { statusesAtom } from '~/store/status-atoms';
import { issuesByStatusAtom } from '~/store/issues-store';
import { viewTypeAtom } from '~/store/view-store';
import type { FC } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GroupIssues } from './group-issues';
import { SearchIssues } from './search-issues';
import { CustomDragLayer } from './issue-grid';
import { cn } from '~/lib/utils/cn';

/**
 * 全課題表示コンポーネント
 * アプリケーション内のすべての課題を表示するメインコンポーネントです。
 * 検索モードとグループ表示モード（リスト/ボード）を切り替えられます。
 * ドラッグ&ドロップ機能も統合されています。
 */
export default function AllIssues() {
  const viewType = useAtomValue(viewTypeAtom);
  const isSearchOpen = false;
  const searchQuery = '';

  const isSearching = isSearchOpen && searchQuery.trim() !== '';
  const isViewTypeGrid = viewType === 'grid';

  return (
    <div className={cn('w-full h-full', isViewTypeGrid && 'overflow-x-auto')}>
      {isSearching ? (
        <SearchIssuesView />
      ) : (
        <GroupIssuesListView isViewTypeGrid={isViewTypeGrid} />
      )}
    </div>
  );
}

/**
 * 検索課題表示コンポーネント
 * 検索モードがアクティブな時に表示される検索結果コンポーネントです。
 */
const SearchIssuesView = () => (
  <div className="px-6 mb-6">
    <SearchIssues />
  </div>
);

/**
 * グループ課題リスト表示コンポーネント
 * ステータスごとにグループ化された課題リストを表示するコンポーネントです。
 * ドラッグ&ドロップ機能を含み、リストまたはボード表示に対応しています。
 */
const GroupIssuesListView: FC<{
  isViewTypeGrid: boolean;
}> = ({ isViewTypeGrid = false }) => {
  const issuesByStatus = useAtomValue(issuesByStatusAtom);
  const statuses = useAtomValue(statusesAtom);

  return (
    <DndProvider backend={HTML5Backend}>
      <CustomDragLayer />
      <div
        className={cn(
          isViewTypeGrid && 'flex h-full gap-3 px-2 py-2 min-w-max'
        )}
      >
        {statuses.map((statusItem) => {
          const issuesForStatus = issuesByStatus[statusItem.id] || [];
          const count = issuesForStatus.length;
          return (
            <GroupIssues
              key={statusItem.id}
              status={statusItem}
              issues={issuesForStatus}
              count={count}
            />
          );
        })}
      </div>
    </DndProvider>
  );
};
