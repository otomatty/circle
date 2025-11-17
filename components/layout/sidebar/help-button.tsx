'use client';

import * as React from 'react';
import { ExternalLink, HelpCircle, Keyboard, Search } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import Link from 'next/link';
import { Box, Linkedin, Twitter, MessageCircle } from 'lucide-react';

export function HelpButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <HelpCircle className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ヘルプを検索..."
              className="pl-8"
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>ショートカット</DropdownMenuLabel>
        <DropdownMenuItem>
          <Keyboard className="mr-2 h-4 w-4" />
          <span>キーボードショートカット</span>
          <span className="ml-auto text-xs text-muted-foreground">⌘/</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>フォローする</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="https://x.com/ln_dev7" target="_blank">
            <Twitter className="mr-2 h-4 w-4" />
            <span>X - Twitter</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="https://threads.net/@ln_dev7" target="_blank">
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>Threads</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="https://linkedin.com/in/lndev" target="_blank">
            <Linkedin className="mr-2 h-4 w-4" />
            <span>LinkedIn</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="https://store.lndev.me/buy/f15f780c-8fbe-40e2-83e8-db1eb421abf4"
            target="_blank"
          >
            <Box className="mr-2 h-4 w-4" />
            <span>プロジェクトを支援</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>新着情報</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link
            href="https://ui.lndev.me"
            target="_blank"
            className="flex items-center"
          >
            <div className="mr-2 flex h-4 w-4 items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            </div>
            <span>lndev-uiを起動</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="https://lndev.me"
            target="_blank"
            className="flex items-center"
          >
            <div className="mr-2 flex h-4 w-4 items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            </div>
            <span>新しいポートフォリオ</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="https://github.com/ln-dev7/circle"
            target="_blank"
            className="flex items-center"
          >
            <div className="mr-2 flex h-4 w-4 items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-transparent" />
            </div>
            <span>GitHub</span>
            <ExternalLink className="ml-2 h-3 w-3 text-muted-foreground" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
