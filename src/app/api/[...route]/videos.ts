import { createDbClient } from "@/db/config/database";
import type { AppEnv } from "@/db/config/hono";
import { tagIdSchema } from "@/db/models/tags";
import { videoInsertSchema, videoUpdateSchema } from "@/db/models/videos";
import { createVideoService } from "@/db/services/videos";
import type { VideoInsert, VideoUpdate } from "@/db/services/videos/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export const videosRouter = new Hono<AppEnv>()
  // 動画一覧の取得（著者情報を含む）
  .get("/", async (c) => {
    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createVideoService(dbClient);
    const videos = await service.getAllVideos();
    return c.json({ success: true, videos });
  })
  // 動画の詳細取得（著者情報を含む）
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createVideoService(dbClient);
    const video = await service.getVideoById(id);
    return c.json({ success: true, video });
  })
  // 動画の追加
  .post("/", zValidator("json", videoInsertSchema), async (c) => {
    const input = c.req.valid("json") as VideoInsert;

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createVideoService(dbClient);
    const id = await service.createVideo(input);

    // 作成後、著者情報を含めて返す
    const video = await service.getVideoById(id);
    return c.json({ success: true, id, video }, 201);
  })
  // 動画の更新
  .patch("/:id", zValidator("json", videoUpdateSchema), async (c) => {
    const id = c.req.param("id");
    const input = c.req.valid("json") as VideoUpdate;

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createVideoService(dbClient);
    await service.updateVideo(id, input);

    // 更新後、著者情報を含めて返す
    const video = await service.getVideoById(id);
    return c.json({ success: true, id, video });
  })
  // 動画の削除
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createVideoService(dbClient);
    await service.deleteVideo(id);
    return c.json({ success: true });
  })
  // 動画にタグを追加
  .post("/:id/tags", zValidator("json", tagIdSchema), async (c) => {
    const videoId = c.req.param("id");
    const { tagId } = c.req.valid("json");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createVideoService(dbClient);
    await service.updateVideoTags(videoId, [tagId]);
    return c.json({ success: true, message: "タグを追加しました" });
  })
  // 動画からタグを削除
  .delete("/:id/tags/:tagId", async (c) => {
    const videoId = c.req.param("id");
    const tagId = c.req.param("tagId");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createVideoService(dbClient);
    await service.removeTagFromVideo(videoId, tagId);
    return c.json({ success: true, message: "タグを削除しました" });
  });
