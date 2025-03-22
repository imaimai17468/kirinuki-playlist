import { createHonoApp } from "@/db/config/hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

// デフォルトの本番用アプリケーション
const app = createHonoApp();

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
