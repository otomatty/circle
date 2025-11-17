'use client';

import {
  Archive,
  Bell,
  Box,
  ChevronRight,
  CopyMinus,
  Layers,
  Link as LinkIcon,
  MoreHorizontal,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar';
import type { Team } from '~/types/teams';
import { ChartPie } from 'lucide-react';

export function NavTeams({ items }: { items: Team[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>チーム</SidebarGroupLabel>
      <SidebarMenu>
        {items
          .filter((item) => item.joined)
          .map((item, index) => (
            <Collapsible
              key={item.id || item.name}
              asChild
              defaultOpen={index === 0}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.name}>
                    <div className="inline-flex size-6 bg-muted/50 items-center justify-center rounded shrink-0">
                      <div className="text-sm">{item.icon}</div>
                    </div>
                    <span className="text-sm">{item.name}</span>
                    <span className="w-3 shrink-0">
                      <ChevronRight className="w-full transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal />
                          <span className="sr-only">その他</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-48 rounded-lg"
                        side="right"
                        align="start"
                      >
                        <DropdownMenuItem>
                          <Settings className="size-4" />
                          <span>チーム設定</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <LinkIcon className="size-4" />
                          <span>リンクをコピー</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="size-4" />
                          <span>アーカイブを開く</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Bell className="size-4" />
                          <span>購読する</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <span>チームを退出...</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/lndev-ui/team/${item.id}/all`}>
                          <CopyMinus size={14} />
                          <span>課題</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/lndev-ui/team/${item.id}/all`}>
                          <ChartPie size={14} />
                          <span>サイクル</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href="/lndev-ui/projects">
                          <Box size={14} />
                          <span>プロジェクト</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href="#">
                          <Layers size={14} />
                          <span>ビュー</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
