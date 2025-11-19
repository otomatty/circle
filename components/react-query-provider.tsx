'use client';

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function ReactQueryProvider(props: React.PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 60秒間はキャッシュを有効にする
            gcTime: 5 * 60 * 1000, // 5分間はガベージコレクションしない（旧cacheTime）
            refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再取得を無効化
            refetchOnReconnect: true, // ネットワーク再接続時の自動再取得を有効化
            retry: 1, // 失敗時のリトライ回数を1回に制限
          },
          mutations: {
            retry: false, // ミューテーションはリトライしない
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
