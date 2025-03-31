import { createDbClient } from "@/db/config/database";
import type { AppEnv } from "@/db/config/hono";
import { tagInsertSchema, tagUpdateSchema } from "@/db/models/tags";
import { createTagService } from "@/db/services/tags/tags";
import type { TagInsert, TagUpdate } from "@/db/services/tags/tags";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// タグIDsの配列または単一の文字列を受け取るスキーマ
const tagIdsSchema = z.object({
  tagIds: z.union([z.string(), z.array(z.string())]).optional(),
});

export const tagsRouter = new Hono<AppEnv>()
  // パラメータを含まないパスを先に定義
  .get("/", async (c) => {
    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createTagService(dbClient);
    const tags = await service.getAllTags();
    return c.json({ success: true, tags });
  })
  // 特定のパスを先に定義
  .get("/videos", zValidator("query", tagIdsSchema), async (c) => {
    const { tagIds = [] } = c.req.valid("query");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createTagService(dbClient);
    if (typeof tagIds === "string") {
      const videoIds = await service.getVideosByTagIds([tagIds]);
      return c.json({ success: true, videoIds });
    }
    const videoIds = await service.getVideosByTagIds(tagIds);
    return c.json({ success: true, videoIds });
  })
  .get("/videos/all", zValidator("query", tagIdsSchema), async (c) => {
    const { tagIds = [] } = c.req.valid("query");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createTagService(dbClient);
    if (typeof tagIds === "string") {
      const videoIds = await service.getVideosByAllTags([tagIds]);
      return c.json({ success: true, videoIds });
    }
    const videoIds = await service.getVideosByAllTags(tagIds);
    return c.json({ success: true, videoIds });
  })
  // 動的パスは最後に定義
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createTagService(dbClient);
    const tag = await service.getTagById(id);
    return c.json({ success: true, tag });
  })
  // タグの追加
  .post("/", zValidator("json", tagInsertSchema), async (c) => {
    const input = c.req.valid("json") as TagInsert;

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createTagService(dbClient);
    const id = await service.createTag(input);

    // 作成後、関連情報を含めて返す
    const tag = await service.getTagById(id);
    return c.json({ success: true, id, tag, message: "タグを作成しました" }, 201);
  })
  // タグの更新
  .patch("/:id", zValidator("json", tagUpdateSchema), async (c) => {
    const id = c.req.param("id");
    const input = c.req.valid("json") as TagUpdate;

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createTagService(dbClient);
    await service.updateTag(id, input);

    // 更新後、関連情報を含めて返す
    const tag = await service.getTagById(id);
    return c.json({ success: true, tag, message: "タグを更新しました" });
  })
  // タグの削除
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createTagService(dbClient);
    await service.deleteTag(id);
    return c.json({ success: true, message: "タグを削除しました" });
  });
