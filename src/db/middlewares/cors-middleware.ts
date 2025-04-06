import { cors } from "hono/cors";

// CORSミドルウェアの設定（開発環境とWebhook用）
export const corsMiddleware = cors({
  origin: "*", // すべてのオリジンを許可（開発環境のみ）
  allowHeaders: ["Content-Type", "svix-id", "svix-timestamp", "svix-signature"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
});
