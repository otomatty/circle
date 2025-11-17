'use client';

import { Button } from '~/components/ui/button';
import { ListFilter } from 'lucide-react';

/**
 * フィルターコンポーネント
 * 課題リストに対してフィルター機能を提供するボタンを表示します。
 * クリックするとフィルターオプションが表示される想定です。
 */
export function Filter() {
  return (
    <Button size="sm" variant="ghost">
      <ListFilter className="size-4 mr-1" />
      フィルター
    </Button>
  );
}
