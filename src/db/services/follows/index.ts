import type { DbClient } from "@/db/config/hono";
import { createBaseFollowService } from "./base";
import type { User } from "./types";

// フォローサービスの作成関数
export const createFollowService = (dbClient: DbClient) => {
  const baseService = createBaseFollowService(dbClient);

  return {
    // 基本操作
    ...baseService,
  };
};

// エクスポートする型定義
export type { User };
