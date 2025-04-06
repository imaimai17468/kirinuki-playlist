import { authorsRouter } from "@/app/api/[...route]/authors";
import { playlistsRouter } from "@/app/api/[...route]/playlists";
import { tagsRouter } from "@/app/api/[...route]/tags";
import { videosRouter } from "@/app/api/[...route]/videos";
import { webhookRouter } from "@/app/api/[...route]/webhook";
import type { createDbClient } from "@/db/config/database";
import { createDevDbClient } from "@/db/config/database";
import type { createTestDbClient } from "@/db/config/test-database";
import { errorHandler } from "@/db/middlewares/error-handler";
import type { Bindings } from "@/db/types/bindings";
import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";

// DBクライアント型の定義
export type DbClient =
  | ReturnType<typeof createDbClient>
  | Awaited<ReturnType<typeof createTestDbClient>>
  | Awaited<ReturnType<typeof createDevDbClient>>;

// 依存性を格納するための型拡張
type Variables = {
  dbClient?: DbClient;
};

// Bindings型にVariablesを追加した合成型
export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

/**
 * 環境に応じたHonoアプリケーションを作成する関数
 * 本番環境では実際のD1データベースを使用し、テスト環境ではテスト用DBクライアントを使用
 */
export function createHonoApp(options?: { dbClient?: DbClient }) {
  // 依存性をコンテキストに注入するミドルウェア
  const injectDependencies: MiddlewareHandler<AppEnv> = async (c, next) => {
    // dbClientが直接提供されている場合はそれを使用
    if (options?.dbClient) {
      c.set("dbClient", options.dbClient);
    } else if (process.env.NODE_ENV === "development") {
      const client = await createDevDbClient();
      c.set("dbClient", client);
    }
    await next();
  };

  // CORSミドルウェアの設定（開発環境とWebhook用）
  const corsMiddleware = cors({
    origin: "*", // すべてのオリジンを許可（開発環境のみ）
    allowHeaders: ["Content-Type", "svix-id", "svix-timestamp", "svix-signature"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  });

  // Honoアプリケーションの組み立て
  const app = new Hono<AppEnv>()
    .basePath("/api")
    .use("*", errorHandler)
    .use("*", injectDependencies) // 依存性注入ミドルウェア
    .use("/webhook/*", corsMiddleware) // Webhookエンドポイント用CORS設定
    .route("/authors", authorsRouter)
    .route("/videos", videosRouter)
    .route("/playlists", playlistsRouter)
    .route("/tags", tagsRouter)
    .route("/webhook", webhookRouter) // webhookルーターの追加
    .get("/hello", (c) => c.json({ status: "ok" }));

  return app;
}
