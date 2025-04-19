"use client";

import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query";

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSRでは、クライアントで即座に再フェッチを避けるために、デフォルトのstaleTimeを0以上に設定することが一般的です
        staleTime: 60 * 1000,
      },
    },
  });
};

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (isServer) {
    // サーバー: 常に新しいクエリクライアントを作成します
    return makeQueryClient();
  }
  // ブラウザ: 既にクライアントが存在しない場合に新しいクエリクライアントを作成します
  // これは非常に重要です。Reactが初期レンダリング中にサスペンドした場合に新しいクライアントを再作成しないようにします。
  // クエリクライアントの作成の下にサスペンスバウンダリがある場合、これは必要ないかもしれません
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
};

export const TanstackQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // 注意: サスペンスバウンダリがこのコードとサスペンドする可能性のあるコードの間にない場合、
  //       クエリクライアントの初期化時にuseStateを避けてください。Reactは初期レンダリングでサスペンドし、
  //       バウンダリがない場合、クライアントを破棄します
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
