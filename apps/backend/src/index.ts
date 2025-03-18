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
app.route("/videos", videosRouter);
app.route("/authors", authorsRouter);

// 簡易ヘルスチェック
app.get("/hello", (c) => c.text("Hello Hono!"));

export default app;
export type AppType = typeof app;
