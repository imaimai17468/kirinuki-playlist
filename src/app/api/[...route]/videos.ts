import { videoInsertSchema, videoUpdateSchema } from "@/db/models/videos";
import { videoService } from "@/db/services/videos";
import type { VideoInsert, VideoUpdate } from "@/db/services/videos";
import type { Bindings } from "@/db/types/bindings";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export const videosRouter = new Hono<{ Bindings: Bindings }>();

// 動画一覧の取得（著者情報を含む）
videosRouter.get("/", async (c) => {
  const { DB } = getRequestContext().env;
  const videos = await videoService.getAllVideos(DB);
  return c.json({ success: true, videos });
});

// 動画の詳細取得（著者情報を含む）
videosRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const { DB } = getRequestContext().env;
  const video = await videoService.getVideoById(DB, id);
  return c.json({ success: true, video });
});

// 動画の追加
videosRouter.post("/", zValidator("json", videoInsertSchema), async (c) => {
  const input = c.req.valid("json") as VideoInsert;
  const { DB } = getRequestContext().env;
  const id = await videoService.createVideo(DB, input);

  // 作成後、著者情報を含めて返す
  const video = await videoService.getVideoById(DB, id);
  return c.json({ success: true, id, video }, 201);
});

// 動画の更新
videosRouter.patch("/:id", zValidator("json", videoUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const input = c.req.valid("json") as VideoUpdate;
  const { DB } = getRequestContext().env;
  await videoService.updateVideo(DB, id, input);

  // 更新後、著者情報を含めて返す
  const video = await videoService.getVideoById(DB, id);
  return c.json({ success: true, id, video });
});

// 動画の削除
videosRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const { DB } = getRequestContext().env;
  await videoService.deleteVideo(DB, id);
  return c.json({ success: true });
});
