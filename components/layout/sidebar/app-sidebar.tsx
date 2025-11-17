import {
  Box,
  ContactRound,
  FolderKanban,
  Inbox,
  UserRound,
} from 'lucide-react';
import type * as React from 'react';
import type { Sidebar } from '~/components/ui/sidebar';

import { getTeams } from '~/actions/teams';
import { getPriorities } from '~/actions/priorities';
import { getStatuses } from '~/actions/status';
import { getProjects } from '~/actions/projects';
import { getLabels } from '~/actions/labels';
import { getUsers } from '~/actions/users';
import { AppSidebarClient } from './app-sidebar-client';
import type { LucideIcon } from 'lucide-react';

// アイコンの名前を文字列で指定するように変更
interface NavItem {
  name: string;
  url: string;
  icon: string; // LucideIconからstringに変更
}

const data = {
  inbox: [
    {
      name: '受信トレイ',
      url: '#',
      icon: 'Inbox', // コンポーネント関数からアイコン名の文字列に変更
    },
    {
      name: '自分の課題',
      url: '#',
      icon: 'FolderKanban', // コンポーネント関数からアイコン名の文字列に変更
    },
  ] as NavItem[],
  workspace: [
    {
      name: 'チーム',
      url: '/lndev-ui/teams',
      icon: 'ContactRound', // コンポーネント関数からアイコン名の文字列に変更
    },
    {
      name: 'プロジェクト',
      url: '/lndev-ui/projects',
      icon: 'Box', // コンポーネント関数からアイコン名の文字列に変更
    },
    {
      name: 'メンバー',
      url: '/lndev-ui/members',
      icon: 'UserRound', // コンポーネント関数からアイコン名の文字列に変更
    },
  ] as NavItem[],
};

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // Server Actionsを使用してデータを取得
  const teamsPromise = getTeams().catch((error) => {
    console.error('チーム情報の取得に失敗:', error);
    return []; // エラー時は空配列を返す
  });

  const prioritiesPromise = getPriorities().catch((error) => {
    console.error('優先度情報の取得に失敗:', error);
    return []; // エラー時は空配列を返す
  });

  // 新しいデータフェッチを追加
  const statusesPromise = getStatuses().catch((error) => {
    console.error('ステータス情報の取得に失敗:', error);
    return [];
  });

  const projectsPromise = getProjects().catch((error) => {
    console.error('プロジェクト情報の取得に失敗:', error);
    return [];
  });

  const labelsPromise = getLabels().catch((error) => {
    console.error('ラベル情報の取得に失敗:', error);
    return [];
  });

  const usersPromise = getUsers().catch((error) => {
    console.error('ユーザー情報の取得に失敗:', error);
    return [];
  });

  // 並列で取得 (Counts系を削除)
  const [teams, priorities, statuses, projects, labels, users] =
    await Promise.all([
      teamsPromise,
      prioritiesPromise,
      statusesPromise,
      projectsPromise,
      labelsPromise,
      usersPromise,
    ]);

  return (
    <AppSidebarClient
      teams={teams}
      priorities={priorities}
      statuses={statuses}
      projects={projects}
      labels={labels}
      users={users}
      inboxData={data.inbox}
      workspaceData={data.workspace}
      {...props}
    />
  );
}
