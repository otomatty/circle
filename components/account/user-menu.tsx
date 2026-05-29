'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useTransition } from 'react';

import { signOut } from '~/actions/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';
import { CreateNewIssue } from '~/components/layout/sidebar/create-new-issue';
import { ThemeToggle } from '~/components/layout/theme-toggle';
import type { User } from '~/types/users';

interface UserMenuProps {
  profile: User;
  teamName?: string;
  teamInitials?: string;
}

export function UserMenu({
  profile,
  teamName = 'Circle',
  teamInitials,
}: UserMenuProps) {
  const [isPending, startTransition] = useTransition();
  const initials =
    teamInitials ??
    (profile.name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U');

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <div className="flex w-full items-center gap-1 pt-2">
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-8 p-1 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.name}
                    width={24}
                    height={24}
                    className="size-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square size-6 items-center justify-center rounded bg-orange-500 text-xs font-semibold text-sidebar-primary-foreground">
                    {initials}
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{teamName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {profile.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <ThemeToggle />
            <CreateNewIssue />
          </div>
          <DropdownMenuContent
            className="min-w-60 w-[--radix-dropdown-menu-trigger-width] rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel>{profile.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/account">アカウント設定</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await signOut();
                });
              }}
            >
              <LogOut className="mr-2 size-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
