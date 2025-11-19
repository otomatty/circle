'use client';

import { Skeleton } from '~/components/ui/skeleton';

/**
 * Create Issue Form Skeleton Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ components/layout/sidebar/create-new-issue/index.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ ~/components/ui/skeleton
 *
 * Related Documentation:
 *   └─ (To be added)
 */

/**
 * 新規課題作成フォームのスケルトンローダー
 * CreateNewIssueコンポーネントのローディング状態を表示します。
 */
export function CreateIssueFormSkeleton() {
  return (
    <div className="w-full sm:max-w-[750px] p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Title input skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Description textarea skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Selectors row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Status selector skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Priority selector skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Assignee and Project selectors */}
      <div className="grid grid-cols-2 gap-4">
        {/* Assignee selector skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Project selector skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Labels selector skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Switch skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Action buttons skeleton */}
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

