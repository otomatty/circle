'use client';

import { Layers, LayoutList, MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@kit/ui/sidebar';
import { Presentation } from 'lucide-react';
import Link from 'next/link';

export function NavWorkspace({
  workspace,
}: {
  workspace: {
    name: string;
    url: string;
    icon: string;
    iconComponent: ReactNode;
  }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>ワークスペース</SidebarGroupLabel>
      <SidebarMenu>
        {workspace.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                {item.iconComponent}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton asChild>
                <span>
                  <MoreHorizontal />
                  <span>その他</span>
                </span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 rounded-lg"
              side="bottom"
              align="start"
            >
              <DropdownMenuItem>
                <Presentation className="text-muted-foreground" />
                <span>イニシアチブ</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Layers className="text-muted-foreground" />
                <span>ビュー</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LayoutList className="text-muted-foreground" />
                <span>サイドバーをカスタマイズ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
