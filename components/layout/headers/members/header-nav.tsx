'use client';

import { Button } from '@kit/ui/button';
import { SidebarTrigger } from '@kit/ui/sidebar';
import { useAtomValue } from 'jotai';
import { usersAtom } from '~/store/user-atoms';
import { Plus } from 'lucide-react';

/**
 * メンバーヘッダーナビゲーションコンポーネント
 * メンバー一覧画面の上部ナビゲーションを提供します。
 * メンバー数の表示と新規メンバー招待ボタンを含みます。
 */
export default function HeaderNav() {
  const users = useAtomValue(usersAtom);

  return (
    <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="" />
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">メンバー</span>
          <span className="text-xs bg-accent rounded-md px-1.5 py-1">
            {users.length}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button className="relative" size="sm" variant="secondary">
          <Plus className="size-4" />
          招待
        </Button>
      </div>
    </div>
  );
}
