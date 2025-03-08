import { Hono } from "hono";
import { errorHandler } from "./middlewares/error-handler";
import { videosRouter } from "./controllers/videos";
import type { Bindings } from "./types";

// アプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

// ミドルウェアの適用
app.use("*", errorHandler);

// ルーターのマウント
app.route("/api/videos", videosRouter);

// 簡易ヘルスチェック
app.get("/api/hello", (c) => c.text("Hello Hono!"));

export default app;
export { app };
