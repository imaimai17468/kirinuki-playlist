import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { videoInsertSchema, videoUpdateSchema } from "../models/videos";
import { videoService } from "../services/videos";
import type { VideoInsert, VideoUpdate } from "../services/videos";
import type { Bindings } from "../types";

export const videosRouter = new Hono<{ Bindings: Bindings }>();

// 動画一覧の取得
videosRouter.get("/", async (c) => {
  const videos = await videoService.getAllVideos(c.env.DB);
  return c.json({ success: true, videos });
});

// 動画の詳細取得
videosRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const video = await videoService.getVideoById(c.env.DB, id);
  return c.json({ success: true, video });
});

// 動画の追加
videosRouter.post("/", zValidator("json", videoInsertSchema), async (c) => {
  const input = c.req.valid("json") as VideoInsert;
  const id = await videoService.createVideo(c.env.DB, input);
  return c.json({ success: true, id }, 201);
});

// 動画の更新
videosRouter.patch("/:id", zValidator("json", videoUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const input = c.req.valid("json") as VideoUpdate;
  await videoService.updateVideo(c.env.DB, id, input);
  return c.json({ success: true, id });
});

// 動画の削除
videosRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await videoService.deleteVideo(c.env.DB, id);
  return c.json({ success: true });
});
