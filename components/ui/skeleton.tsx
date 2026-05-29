import { cn } from '~/lib/utils/cn';

/**
 * Skeleton Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ (To be added as we implement skeleton loaders)
 *
 * Dependencies (External files that this file imports):
 *   └─ ~/lib/utils/cn
 *
 * Related Documentation:
 *   └─ (To be added)
 */

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };

