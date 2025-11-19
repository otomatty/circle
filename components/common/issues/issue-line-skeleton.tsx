'use client';

import { Skeleton } from '~/components/ui/skeleton';

/**
 * Issue Line Skeleton Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ (To be added)
 *
 * Dependencies (External files that this file imports):
 *   ├─ ~/components/ui/skeleton
 *
 * Related Documentation:
 *   └─ (To be added)
 */

/**
 * 課題リスト行のスケルトンローダー
 * IssueLineコンポーネントのローディング状態を表示します。
 */
export function IssueLineSkeleton() {
  return (
    <div className="w-full flex items-center justify-start h-11 px-6">
      <div className="flex items-center gap-0.5">
        {/* Priority selector skeleton */}
        <Skeleton className="h-4 w-4 rounded" />
        {/* Identifier skeleton */}
        <Skeleton className="h-4 w-[66px] hidden sm:block shrink-0 mr-0.5" />
        {/* Status selector skeleton */}
        <Skeleton className="h-5 w-16 rounded" />
      </div>
      {/* Title skeleton */}
      <Skeleton className="h-4 w-48 ml-0.5 mr-1" />
      <div className="flex items-center justify-end gap-2 ml-auto sm:w-fit">
        <div className="w-3 shrink-0" />
        {/* Labels skeleton */}
        <div className="hidden sm:flex gap-1 -space-x-5">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        {/* Date skeleton */}
        <Skeleton className="h-3 w-12 shrink-0 hidden sm:block" />
        {/* Assignee skeleton */}
        <Skeleton className="h-6 w-6 rounded-full shrink-0" />
      </div>
    </div>
  );
}

/**
 * 複数の課題リスト行のスケルトンローダー
 */
export function IssueLineSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, index) => (
        <IssueLineSkeleton key={index} />
      ))}
    </div>
  );
}

