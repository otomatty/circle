'use client';

import { usersAtom } from '~/store/user-atoms';
import MemberLine from './member-line';
import { useAtomValue } from 'jotai';

/**
 * メンバー一覧コンポーネント
 * アプリケーションのメンバーをテーブル形式で表示します。
 * 名前、ステータス、参加日、所属チームなどの情報を一覧表示します。
 * レスポンシブデザインで、画面サイズによって表示する列を調整します。
 */
export default function Members() {
  const users = useAtomValue(usersAtom);

  return (
    <div className="w-full">
      <div className="bg-container px-6 py-1.5 text-sm flex items-center text-muted-foreground border-b sticky top-0 z-10">
        <div className="w-[70%] md:w-[60%] lg:w-[55%]">名前</div>
        <div className="w-[30%] md:w-[20%] lg:w-[15%]">ステータス</div>
        <div className="hidden lg:block w-[15%]">参加日</div>
        <div className="w-[30%] hidden md:block md:w-[20%] lg:w-[15%]">
          チーム
        </div>
      </div>

      <div className="w-full">
        {users.map((user) => (
          <MemberLine key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
