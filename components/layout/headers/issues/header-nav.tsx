'use client';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { SidebarTrigger } from '@kit/ui/sidebar';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  isSearchOpenAtom,
  searchQueryAtom,
  toggleSearchAtom,
  closeSearchAtom,
  setSearchQueryAtom,
} from '~/store/search-store';
import { SearchIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import Notifications from './notifications';

/**
 * ヘッダーナビゲーションコンポーネント
 * アプリケーションのヘッダー上部に表示される検索機能と通知機能を提供します。
 * サイドバーのトリガーボタンも含まれています。
 */
export default function HeaderNav() {
  const isSearchOpen = useAtomValue(isSearchOpenAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const toggleSearch = useSetAtom(toggleSearchAtom);
  const closeSearch = useSetAtom(closeSearchAtom);
  const setSearchQuery = useSetAtom(setSearchQueryAtom);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const previousValueRef = useRef<string>('');

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        isSearchOpen
      ) {
        if (searchQuery.trim() === '') {
          closeSearch();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, closeSearch, searchQuery]);

  return (
    <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
      <SidebarTrigger className="" />

      <div className="flex items-center gap-2">
        {isSearchOpen ? (
          <div
            ref={searchContainerRef}
            className="relative flex items-center justify-center w-64 transition-all duration-200 ease-in-out"
          >
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => {
                previousValueRef.current = searchQuery;
                const newValue = e.target.value;
                setSearchQuery(newValue);

                if (previousValueRef.current && newValue === '') {
                  const inputEvent = e.nativeEvent as InputEvent;
                  if (
                    inputEvent.inputType !== 'deleteContentBackward' &&
                    inputEvent.inputType !== 'deleteByCut'
                  ) {
                    closeSearch();
                  }
                }
              }}
              placeholder="課題を検索..."
              className="pl-8 h-7 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  if (searchQuery.trim() === '') {
                    closeSearch();
                  } else {
                    setSearchQuery('');
                  }
                }
              }}
            />
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              className="h-8 w-8"
              aria-label="検索"
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
            <Notifications />
          </>
        )}
      </div>
    </div>
  );
}
