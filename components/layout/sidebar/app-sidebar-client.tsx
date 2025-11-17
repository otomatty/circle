'use client';

import {
  Box,
  ContactRound,
  FolderKanban,
  Github,
  Inbox,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import Link from 'next/link';

import { HelpButton } from '~/components/layout/sidebar/help-button';
import { NavInbox } from '~/components/layout/sidebar/nav-inbox';
import { NavTeams } from '~/components/layout/sidebar/nav-teams';
import { NavWorkspace } from '~/components/layout/sidebar/nav-workspace';
import { OrgSwitcher } from '~/components/layout/sidebar/org-switcher';
import { Button } from '~/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '~/components/ui/sidebar';
import type { Priority } from '~/types/priorities';
import type { Team } from '~/types/teams';
import type { Status } from '~/types/status';
import type { Project } from '~/types/projects';
import type { LabelInterface } from '~/types/labels';
import type { User } from '~/types/users';
import { useSetAtom } from 'jotai';
import { statusesAtom } from '~/store/status-atoms';
import { projectsAtom } from '~/store/project-atoms';
import { labelsAtom } from '~/store/label-atoms';
import { usersAtom } from '~/store/user-atoms';
import { prioritiesAtom } from '~/store/priority-atoms';
import { teamsAtom } from '~/store/team-atoms';
import { useEffect } from 'react';
import { getIconFromString } from '~/utils/icon-utils';

// アイコン名とコンポーネントのマッピング
const iconMap: Record<string, LucideIcon> = {
  Inbox,
  FolderKanban,
  ContactRound,
  Box,
  UserRound,
};

// NavItemの型定義を修正
interface NavItem {
  name: string;
  url: string;
  icon: string; // LucideIconからstringに変更
}

interface AppSidebarClientProps extends React.ComponentProps<typeof Sidebar> {
  teams: Team[];
  priorities: Array<Omit<Priority, 'icon'> & { icon: string }>;
  statuses: Array<Omit<Status, 'icon'> & { icon: string }>;
  projects: Array<Omit<Project, 'icon'> & { icon: string }>;
  labels: LabelInterface[];
  users: User[];
  inboxData: NavItem[];
  workspaceData: NavItem[];
}

export function AppSidebarClient({
  teams,
  priorities,
  statuses,
  projects,
  labels,
  users,
  inboxData,
  workspaceData,
  ...props
}: AppSidebarClientProps) {
  const [open, setOpen] = React.useState(true);

  // atomの更新関数を取得
  const setStatuses = useSetAtom(statusesAtom);
  const setProjects = useSetAtom(projectsAtom);
  const setLabels = useSetAtom(labelsAtom);
  const setUsers = useSetAtom(usersAtom);
  const setPriorities = useSetAtom(prioritiesAtom);
  const setTeams = useSetAtom(teamsAtom);

  // マウント時にデータをatomに設定
  // Server Actionsから受け取った文字列のiconをLucideIconに変換
  useEffect(() => {
    // 文字列のiconをLucideIconに変換
    const statusesWithIcons: Status[] = statuses.map((s) => ({
      ...s,
      icon: getIconFromString(s.icon),
    }));

    const projectsWithIcons: Project[] = projects.map((p) => ({
      ...p,
      icon: getIconFromString(p.icon),
    }));

    const prioritiesWithIcons: Priority[] = priorities.map((p) => ({
      ...p,
      icon: getIconFromString(p.icon),
    }));

    setStatuses(statusesWithIcons);
    setProjects(projectsWithIcons);
    setLabels(labels);
    setUsers(users);
    setPriorities(prioritiesWithIcons);
    setTeams(teams);
  }, [
    statuses,
    projects,
    labels,
    users,
    priorities,
    teams,
    setStatuses,
    setProjects,
    setLabels,
    setUsers,
    setPriorities,
    setTeams,
  ]);

  // アイコン名からコンポーネントを取得する関数
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  // データにアイコンコンポーネントを追加
  const inboxWithIcons = inboxData.map((item) => ({
    ...item,
    iconComponent: getIconComponent(item.icon),
  }));

  const workspaceWithIcons = workspaceData.map((item) => ({
    ...item,
    iconComponent: getIconComponent(item.icon),
  }));

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavInbox inbox={inboxWithIcons} />
        <NavWorkspace workspace={workspaceWithIcons} />
        <NavTeams items={teams} />
      </SidebarContent>
      <SidebarFooter>
        <div className="w-full flex flex-col gap-2">
          {open && (
            <div className="group/sidebar relative flex flex-col gap-2 rounded-lg border p-4 text-sm w-full">
              <button
                className="absolute top-2.5 right-2 z-10 cursor-pointer"
                onClick={() => setOpen(!open)}
                type="button"
              >
                <X className="size-4" />
              </button>
              <div className="text-balance text-lg font-semibold leading-tight group-hover/sidebar:underline">
                lndevによる優れたコンポーネント
              </div>
              <div>
                開発プロセスを効率化するための、小さくて優れたコンポーネントの楽しいコレクション。
              </div>
              <Link
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0"
                href="https://ui.lndev.me"
              >
                <span className="sr-only">Vercelにデプロイ</span>
              </Link>
              <Button size="sm" className="w-full">
                <Link
                  href="https://ui.lndev.me"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ui.lndev.me
                </Link>
              </Button>
            </div>
          )}
          <div className="w-full flex items-center justify-between">
            <HelpButton />
            <Button size="icon" variant="secondary" asChild>
              <Link
                href="https://github.com/ln-dev7/circle"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
