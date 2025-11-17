'use client';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils/cn';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  viewTypeAtom,
  setViewTypeAtom,
  type ViewType,
} from '~/store/view-store';
import { LayoutGrid, LayoutList, SlidersHorizontal } from 'lucide-react';
import { Filter } from './filter';

/**
 * ヘッダーオプションコンポーネント
 * 課題の表示方法を切り替えるためのオプション群を提供します。
 * リスト表示とボード（グリッド）表示の切り替えが可能です。
 */
export default function HeaderOptions() {
  const viewType = useAtomValue(viewTypeAtom);
  const setViewType = useSetAtom(setViewTypeAtom);

  const handleViewChange = (type: ViewType) => {
    setViewType(type);
  };

  return (
    <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
      <Filter />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="relative" size="sm" variant="secondary">
            <SlidersHorizontal className="size-4 mr-1" />
            表示
            {viewType === 'grid' && (
              <span className="absolute right-0 top-0 w-2 h-2 bg-orange-500 rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 flex p-3 gap-2" align="end">
          <DropdownMenuItem
            onClick={() => handleViewChange('list')}
            className={cn(
              'w-full text-xs border border-accent flex flex-col gap-1',
              viewType === 'list' ? 'bg-accent' : ''
            )}
          >
            <LayoutList className="size-4" />
            リスト
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleViewChange('grid')}
            className={cn(
              'w-full text-xs border border-accent flex flex-col gap-1',
              viewType === 'grid' ? 'bg-accent' : ''
            )}
          >
            <LayoutGrid className="size-4" />
            ボード
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
