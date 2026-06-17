'use client';

import {
  Box,
  ContactRound,
  FolderKanban,
  Inbox,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';

import { HelpButton } from '~/components/layout/sidebar/help-button';
import { NavInbox } from '~/components/layout/sidebar/nav-inbox';
import { NavTeams } from '~/components/layout/sidebar/nav-teams';
import { NavWorkspace } from '~/components/layout/sidebar/nav-workspace';
import { UserMenu } from '~/components/account/user-menu';
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
  teams: Array<Omit<Team, 'projects'> & { projects: Array<Omit<Team['projects'][0], 'icon'> & { icon: string }> }>;
  priorities: Array<Omit<Priority, 'icon'> & { icon: string }>;
  statuses: Array<Omit<Status, 'icon'> & { icon: string }>;
  projects: Array<Omit<Project, 'icon'> & { icon: string }>;
  labels: LabelInterface[];
  users: User[];
  profile: User | null;
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
  profile,
  inboxData,
  workspaceData,
  ...props
}: AppSidebarClientProps) {
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
    
    // teamsのprojects内のiconも変換
    const teamsWithIcons: Team[] = teams.map((team) => ({
      ...team,
      projects: team.projects.map((project) => ({
        ...project,
        icon: getIconFromString(project.icon),
      })),
    }));
    setTeams(teamsWithIcons);
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
        {profile ? (
          <UserMenu profile={profile} teamName="Circle" />
        ) : null}
      </SidebarHeader>
      <SidebarContent>
        <NavInbox inbox={inboxWithIcons} />
        <NavWorkspace workspace={workspaceWithIcons} />
        <NavTeams items={teams} />
      </SidebarContent>
      <SidebarFooter>
        <div className="w-full flex items-center justify-between">
          <HelpButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
