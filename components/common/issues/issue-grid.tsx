'use client';

import type { Issue } from '~/types/issues';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
  type DragSourceMonitor,
  useDrag,
  useDragLayer,
  useDrop,
} from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { AssigneeUser } from './assignee-user';
import { LabelBadge } from './label-badge';
import { PrioritySelector } from './priority-selector';

import { ProjectBadge } from './project-badge';
import { StatusSelector } from './status-selector';

/**
 * 課題グリッド表示関連のコンポーネント
 * ボード表示におけるカード形式の課題表示と、ドラッグ&ドロップ機能を実装しています。
 */

export const IssueDragType = 'ISSUE';
type IssueGridProps = {
  issue: Issue;
};

/**
 * 課題ドラッグプレビューコンポーネント
 * ドラッグ中に表示される課題カードのプレビューを描画します。
 * 課題のタイトル、優先度、ステータス、ラベルなどを含みます。
 */
function IssueDragPreview({ issue }: { issue: Issue }) {
  return (
    <div className="w-full p-3 bg-background rounded-md border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <PrioritySelector priority={issue.priority} issueId={issue.id} />
          <span className="text-xs text-muted-foreground font-medium">
            {issue.identifier}
          </span>
        </div>
        <StatusSelector status={issue.status} issueId={issue.id} />
      </div>

      <h3 className="text-sm font-semibold mb-3 line-clamp-2">{issue.title}</h3>

      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[1.5rem]">
        <LabelBadge label={issue.labels} />
        {issue.project && <ProjectBadge project={issue.project} />}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs text-muted-foreground">
          {format(new Date(issue.createdAt), 'MMM dd')}
        </span>
        <AssigneeUser user={issue.assignees} />
      </div>
    </div>
  );
}

/**
 * カスタムドラッグレイヤーコンポーネント
 * ドラッグ操作中にカスタムプレビューを表示するためのレイヤーです。
 * ドラッグ中の課題カードが視覚的に表示されます。
 */
export function CustomDragLayer() {
  const { itemType, isDragging, item, currentOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem() as Issue,
      itemType: monitor.getItemType(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );

  if (!isDragging || itemType !== IssueDragType || !currentOffset) {
    return null;
  }

  return (
    <div
      className="fixed pointer-events-none z-50 left-0 top-0"
      style={{
        transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
        width: '348px', // カードの幅に合わせる
      }}
    >
      <IssueDragPreview issue={item} />
    </div>
  );
}

/**
 * 課題グリッドコンポーネント
 * ボード表示で使用される個々の課題カードを表示します。
 * ドラッグ&ドロップ機能を備え、課題の詳細情報を表示します。
 */
export function IssueGrid({ issue }: IssueGridProps) {
  const ref = useRef<HTMLDivElement>(null);

  // ドラッグ機能のセットアップ
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: IssueDragType,
    item: issue,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // 空の画像をドラッグプレビューとして使用（カスタムプレビューを作成するため）
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // ドロップ機能のセットアップ
  const [, drop] = useDrop(() => ({
    accept: IssueDragType,
  }));

  // ドラッグとドロップを要素に接続
  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      className="w-full p-3 bg-background rounded-md shadow-xs border border-border/50 cursor-default"
      layoutId={`issue-grid-${issue.identifier}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <PrioritySelector priority={issue.priority} issueId={issue.id} />
          <span className="text-xs text-muted-foreground font-medium">
            {issue.identifier}
          </span>
        </div>
        <StatusSelector status={issue.status} issueId={issue.id} />
      </div>

      <h3 className="text-sm font-semibold mb-3 line-clamp-2">{issue.title}</h3>

      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[1.5rem]">
        <LabelBadge label={issue.labels} />
        {issue.project && <ProjectBadge project={issue.project} />}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs text-muted-foreground">
          {format(new Date(issue.createdAt), 'MMM dd')}
        </span>
        <AssigneeUser user={issue.assignees} />
      </div>
    </motion.div>
  );
}
