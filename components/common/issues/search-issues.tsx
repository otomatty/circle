'use client';

import { useAtomValue } from 'jotai';
import { isSearchOpenAtom, searchQueryAtom } from '~/store/search-store';
import { searchedIssuesAtom } from '~/store/issues-store';
import type { Issue } from '~/types/issues';
import { IssueLine } from './issue-line';

/**
 * 課題検索結果コンポーネント
 * 検索クエリに基づいて課題を検索し、結果を表示します。
 * 検索結果のカウントと課題のリストを表示し、結果がない場合は
 * メッセージを表示します。検索が有効でないときは何も表示しません。
 */
export function SearchIssues() {
  const searchQuery = useAtomValue(searchQueryAtom);
  const isSearchOpen = useAtomValue(isSearchOpenAtom);
  const searchResults = useAtomValue(searchedIssuesAtom(searchQuery));

  if (!isSearchOpen || searchQuery.trim() === '') {
    return null;
  }

  return (
    <div className="w-full">
      <div>
        {searchResults.length > 0 ? (
          <div className="border rounded-md mt-4">
            <div className="py-2 px-4 border-b bg-muted/50">
              <h3 className="text-sm font-medium">
                検索結果 ({searchResults.length})
              </h3>
            </div>
            <div className="divide-y">
              {searchResults.map((issue: Issue) => (
                <IssueLine key={issue.id} issue={issue} layoutId={false} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            &quot;{searchQuery}&quot; に一致する結果が見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
}
