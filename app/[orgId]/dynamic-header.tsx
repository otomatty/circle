'use client';

import { usePathname } from 'next/navigation';
import TeamsHeader from '~/components/layout/headers/teams/header';
import IssuesHeader from '~/components/layout/headers/issues/header';
import MembersHeader from '~/components/layout/headers/members/header';

export default function DynamicHeader() {
  const pathname = usePathname();

  if (pathname.includes('/teams')) {
    return <TeamsHeader />;
  }

  if (pathname.includes('/team/')) {
    return <IssuesHeader />;
  }

  if (pathname.includes('/issues')) {
    return <IssuesHeader />;
  }

  if (pathname.includes('/members')) {
    return <MembersHeader />;
  }

  // プロジェクトページには何も表示しない
  if (pathname.includes('/projects')) {
    return null;
  }

  // デフォルトのヘッダー
  return <TeamsHeader />;
}
