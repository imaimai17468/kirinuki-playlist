import { QueryClient } from "@tanstack/react-query";

// QueryClientのインスタンスを作成
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // デフォルト設定
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 10, // 10分
      retry: 1, // リトライは1回のみ
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化
    },
  },
});
