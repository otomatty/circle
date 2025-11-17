'use client';

import { Button } from '~/components/ui/button';
import { ListFilter, SlidersHorizontal } from 'lucide-react';

/**
 * メンバーヘッダーオプションコンポーネント
 * メンバー一覧画面の表示オプションを提供します。
 * フィルターボタンと表示設定ボタンを含みます。
 */
export default function HeaderOptions() {
  return (
    <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
      <Button size="sm" variant="ghost">
        <ListFilter className="size-4 mr-1" />
        フィルター
      </Button>
      <Button className="relative" size="sm" variant="secondary">
        <SlidersHorizontal className="size-4 mr-1" />
        表示
      </Button>
    </div>
  );
}
