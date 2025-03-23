import type { AppType } from "@/app/api/[...route]/route";
import { getBaseURL } from "@/db/config/baseUrl";
import { hc } from "hono/client";

/**
 * APIクライアントインターフェース
 * 本番環境ではhcを使用したHonoクライアント
 * テスト環境ではtestClientを使用するためのインターフェース
 */
export type ApiClient = ReturnType<typeof hc<AppType>>;

// デフォルトのAPIクライアント（シングルトンパターン）
let currentClient: ApiClient | null = null;

/**
 * 本番環境用APIクライアントを作成
 * @returns 実際のAPIに接続するクライアント
 */
export function createProdClient(): ApiClient {
  return hc<AppType>(`${getBaseURL()}/api`);
}

/**
 * テスト環境用APIクライアントを作成・設定
 * @param client テスト用クライアント
 */
export function setApiClient(client: ApiClient): void {
  currentClient = client;
}

/**
 * 現在のAPIクライアントを取得
 * セットされていない場合は本番用クライアントを作成
 */
export function getApiClient(): ApiClient {
  if (!currentClient) {
    currentClient = createProdClient();
  }
  return currentClient;
}
