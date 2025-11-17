'use client';

import type { Issue } from '~/types/issues';
import type { Status } from '~/types/status';
import { useAtomValue, useSetAtom } from 'jotai';
import { viewTypeAtom } from '~/store/view-store';
import { updateIssueStatusAtom } from '~/store/issues-store';
import { cn } from '~/lib/utils/cn';
import { Plus } from 'lucide-react';
import { type FC, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { Button } from '~/components/ui/button';
import { IssueDragType, IssueGrid } from './issue-grid';
import { IssueLine } from './issue-line';
import { openCreateIssueModalAtom } from '~/store/create-issue-store';
import { sortIssuesByPriority } from '~/utils/issue-utils';
import { AnimatePresence, motion } from 'framer-motion';
import { getIconFromString } from '~/utils/icon-utils';

/**
 * 課題グループコンポーネント
 * 特定のステータス（進行状況）ごとに課題をグループ化して表示します。
 * リスト表示とグリッド（ボード）表示の両方に対応し、
 * ドラッグ＆ドロップでステータスを変更できるUI機能も提供します。
 */
interface GroupIssuesProps {
  status: Status;
  issues: Issue[];
  count: number;
}

export function GroupIssues({ status, issues, count }: GroupIssuesProps) {
  const viewType = useAtomValue(viewTypeAtom);
  const isViewTypeGrid = viewType === 'grid';
  const openModal = useSetAtom(openCreateIssueModalAtom);
  const sortedIssues = sortIssuesByPriority(issues);

  return (
    <div
      className={cn(
        'bg-conainer',
        isViewTypeGrid
          ? 'overflow-hidden rounded-md h-full flex-shrink-0 w-[348px] flex flex-col'
          : ''
      )}
    >
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
          style={{
            backgroundColor: isViewTypeGrid
              ? `${status.color}10`
              : `${status.color}08`,
          }}
        >
          <div className="flex items-center gap-2">
            {(() => {
              const Icon =
                typeof status.icon === 'string'
                  ? getIconFromString(status.icon)
                  : status.icon;
              return <Icon />;
            })()}
            <span className="text-sm font-medium">{status.name}</span>
            <span className="text-sm text-muted-foreground">{count}</span>
          </div>

          <Button
            className="size-6"
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              openModal(status);
            }}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {viewType === 'list' ? (
        <div className="space-y-0">
          {sortedIssues.map((issue) => (
            <IssueLine key={issue.id} issue={issue} layoutId={true} />
          ))}
        </div>
      ) : (
        <IssueGridList issues={issues} status={status} />
      )}
    </div>
  );
}

/**
 * 課題グリッドリストコンポーネント
 * ボード表示モードで使用される課題のグリッドリストを表示します。
 * ドラッグ＆ドロップ機能を実装し、課題のステータスを視覚的に変更できます。
 */
const IssueGridList: FC<{ issues: Issue[]; status: Status }> = ({
  issues,
  status,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const updateIssueStatus = useSetAtom(updateIssueStatusAtom);

  // ドロップ機能のセットアップ：課題アイテムのみを受け入れる
  const [{ isOver }, drop] = useDrop(() => ({
    accept: IssueDragType,
    drop(item: Issue, monitor) {
      if (monitor.didDrop() && item.status.id !== status.id) {
        updateIssueStatus({ issueId: item.id, newStatus: status });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  drop(ref);

  const sortedIssues = sortIssuesByPriority(issues);

  return (
    <div
      ref={ref}
      className="flex-1 h-full overflow-y-auto p-2 space-y-2 bg-zinc-50/50 dark:bg-zinc-900/50 relative"
    >
      <AnimatePresence>
        {isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed top-0 left-0 right-0 bottom-0 z-10 flex items-center justify-center pointer-events-none bg-background/90"
            style={{
              width: ref.current?.getBoundingClientRect().width || '100%',
              height: ref.current?.getBoundingClientRect().height || '100%',
              transform: `translate(${ref.current?.getBoundingClientRect().left || 0}px, ${ref.current?.getBoundingClientRect().top || 0}px)`,
            }}
          >
            <div className="bg-background border border-border rounded-md p-3 shadow-md max-w-[90%]">
              <p className="text-sm font-medium text-center">
                優先度順にボード表示されます
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {sortedIssues.map((issue) => (
        <IssueGrid key={issue.id} issue={issue} />
      ))}
    </div>
  );
};
