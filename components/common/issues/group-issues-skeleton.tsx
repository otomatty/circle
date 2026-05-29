'use client';

import { Skeleton } from '~/components/ui/skeleton';
import { IssueLineSkeletonList } from './issue-line-skeleton';
import { IssueGridSkeletonList } from './issue-grid-skeleton';
import { cn } from '~/lib/utils/cn';

/**
 * Group Issues Skeleton Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ (To be added)
 *
 * Dependencies (External files that this file imports):
 *   ├─ ~/components/ui/skeleton
 *   ├─ ~/components/common/issues/issue-line-skeleton
 *   ├─ ~/components/common/issues/issue-grid-skeleton
 *   └─ ~/lib/utils/cn
 *
 * Related Documentation:
 *   └─ (To be added)
 */

interface GroupIssuesSkeletonProps {
  isViewTypeGrid?: boolean;
  issueCount?: number;
}

/**
 * 課題グループのスケルトンローダー
 * GroupIssuesコンポーネントのローディング状態を表示します。
 */
export function GroupIssuesSkeleton({
  isViewTypeGrid = false,
  issueCount = 3,
}: GroupIssuesSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-container',
        isViewTypeGrid
          ? 'overflow-hidden rounded-md h-full flex-shrink-0 w-[348px] flex flex-col'
          : ''
      )}
    >
      {/* Header skeleton */}
      <div
        className={cn(
          'sticky top-0 z-10 bg-container w-full',
          isViewTypeGrid ? 'rounded-t-md h-[50px]' : 'h-10'
        )}
      >
        <div
          className={cn(
            'w-full h-full flex items-center justify-between',
            isViewTypeGrid ? 'px-3' : 'px-6'
          )}
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-6" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>

      {/* Content skeleton */}
      {isViewTypeGrid ? (
        <div className="flex-1 h-full overflow-y-auto p-2 space-y-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <IssueGridSkeletonList count={issueCount} />
        </div>
      ) : (
        <IssueLineSkeletonList count={issueCount} />
      )}
    </div>
  );
}

/**
 * 複数の課題グループのスケルトンローダー
 */
interface GroupIssuesSkeletonListProps {
  isViewTypeGrid?: boolean;
  groupCount?: number;
  issueCountPerGroup?: number;
}

export function GroupIssuesSkeletonList({
  isViewTypeGrid = false,
  groupCount = 3,
  issueCountPerGroup = 3,
}: GroupIssuesSkeletonListProps) {
  return (
    <div
      className={cn(
        isViewTypeGrid && 'flex h-full gap-3 px-2 py-2 min-w-max'
      )}
    >
      {Array.from({ length: groupCount }).map((_, index) => (
        <GroupIssuesSkeleton
          key={index}
          isViewTypeGrid={isViewTypeGrid}
          issueCount={issueCountPerGroup}
        />
      ))}
    </div>
  );
}

