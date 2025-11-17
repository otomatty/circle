'use client';

import { CreateNewIssue } from '~/components/layout/sidebar/create-new-issue';

/**
 * 課題作成モーダルプロバイダーコンポーネント
 * 課題を作成するためのモーダルを提供するプロバイダーコンポーネントです。
 * 画面上には表示されませんが、アプリケーション全体で課題作成モーダルを
 * 呼び出せるようにするために使用されます。
 */
export function CreateIssueModalProvider() {
  return (
    <div className="hidden">
      <CreateNewIssue />
    </div>
  );
}
