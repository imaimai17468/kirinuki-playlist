import { Hono } from "hono";
import { authorsRouter } from "./controllers/authors";
import { videosRouter } from "./controllers/videos";
import { errorHandler } from "./middlewares/error-handler";
import type { Bindings } from "./types";

// アプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

// ミドルウェアの適用
app.use("*", errorHandler);

// ルーターのマウント
app.route("/api/videos", videosRouter);
app.route("/api/authors", authorsRouter);

// 簡易ヘルスチェック
app.get("/api/hello", (c) => c.text("Hello Hono!"));

export default app;
export type AppType = typeof app;
