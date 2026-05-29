'use client';

import { useAtomValue } from 'jotai';
import { statusesAtom } from '~/store/status-atoms';
import { issuesByStatusAtom } from '~/store/issues-store';
import { viewTypeAtom } from '~/store/view-store';
import type { FC } from 'react';
import { useState, useEffect, lazy, Suspense } from 'react';
import { GroupIssues } from './group-issues';
import { SearchIssues } from './search-issues';
import { CustomDragLayer } from './issue-grid';
import { GroupIssuesSkeletonList } from './group-issues-skeleton';
import { cn } from '~/lib/utils/cn';

// react-dndを動的インポート（バンドルサイズ削減）
const DndProvider = lazy(() =>
  import('react-dnd').then((mod) => ({ default: mod.DndProvider }))
);

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
    <div
      className={cn('w-full h-full', isViewTypeGrid && 'overflow-x-auto')}
      role="main"
      aria-label={isViewTypeGrid ? '課題ボード表示' : '課題リスト表示'}
    >
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
    <Suspense
      fallback={
        <GroupIssuesSkeletonList
          isViewTypeGrid={isViewTypeGrid}
          groupCount={statuses.length || 3}
          issueCountPerGroup={3}
        />
      }
    >
      <DndProviderWrapper>
        <CustomDragLayer />
        <div
          className={cn(
            isViewTypeGrid && 'flex h-full gap-3 px-2 py-2 min-w-max'
          )}
          role={isViewTypeGrid ? 'region' : 'list'}
          aria-label="課題グループ一覧"
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
      </DndProviderWrapper>
    </Suspense>
  );
};

/**
 * DndProviderのラッパーコンポーネント
 * HTML5Backendを動的に読み込む
 */
const DndProviderWrapper: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [backend, setBackend] = useState<any>(null);

  useEffect(() => {
    import('react-dnd-html5-backend').then((mod) => {
      setBackend(mod.HTML5Backend);
    });
  }, []);

  if (!backend) {
    return (
      <GroupIssuesSkeletonList
        isViewTypeGrid={false}
        groupCount={3}
        issueCountPerGroup={3}
      />
    );
  }

  return <DndProvider backend={backend}>{children}</DndProvider>;
};
