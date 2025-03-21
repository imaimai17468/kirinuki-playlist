import { errorHandler } from "@/db/middlewares/error-handler";
import type { Bindings } from "@/db/types/bindings";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { authorsRouter } from "./author";
import { playlistsRouter } from "./playlists";
import { videosRouter } from "./videos";

export const runtime = "edge";

const app = new Hono<{ Bindings: Bindings }>()
  .basePath("/api")
  .use("*", errorHandler)
  .route("/authors", authorsRouter)
  .route("/videos", videosRouter)
  .route("/playlists", playlistsRouter)
  .get("/hello", (c) => c.json({ status: "ok" }));

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
