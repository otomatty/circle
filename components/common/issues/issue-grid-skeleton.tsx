'use client';

import { Skeleton } from '~/components/ui/skeleton';

/**
 * Issue Grid Skeleton Component
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
 * 課題グリッドカードのスケルトンローダー
 * IssueGridコンポーネントのローディング状態を表示します。
 */
export function IssueGridSkeleton() {
  return (
    <div className="w-full p-3 bg-background rounded-md shadow-xs border border-border/50">
      {/* Header: Priority, Identifier, Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-16 rounded" />
      </div>

      {/* Title */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-3" />

      {/* Labels and Project */}
      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[1.5rem]">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      {/* Footer: Date and Assignee */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

/**
 * 複数の課題グリッドカードのスケルトンローダー
 */
export function IssueGridSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <IssueGridSkeleton key={index} />
      ))}
    </div>
  );
}

