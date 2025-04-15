import { createDbClient } from "@/db/config/database";
import type { AppEnv } from "@/db/config/hono";
import { authorInsertSchema, authorUpdateSchema } from "@/db/models/authors";
import { createAuthorService } from "@/db/services/authors/authors";
import type { AuthorInsert, AuthorUpdate } from "@/db/services/authors/authors";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// withVideosクエリパラメータのバリデーションスキーマ
const withVideosSchema = z.object({
  withVideos: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
});

export const authorsRouter = new Hono<AppEnv>()
  // 作成者一覧の取得
  .get("/", async (c) => {
    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);
    const authors = await service.getAllAuthors();
    return c.json({ success: true, authors });
  })
  // 作成者の詳細取得
  .get("/:id", zValidator("query", withVideosSchema), async (c) => {
    const id = c.req.param("id");
    const { withVideos = false } = c.req.valid("query");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);

    if (withVideos) {
      const authorWithVideos = await service.getAuthorWithVideos(id);
      return c.json({ success: true, author: authorWithVideos });
    }

    const author = await service.getAuthorById(id);
    return c.json({ success: true, author });
  })
  // 作成者の追加
  .post("/", zValidator("json", authorInsertSchema), async (c) => {
    const input = c.req.valid("json") as AuthorInsert;

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);
    const id = await service.createAuthor(input);
    return c.json({ success: true, id }, 201);
  })
  // 作成者の更新
  .patch("/:id", zValidator("json", authorUpdateSchema), async (c) => {
    const id = c.req.param("id");
    const input = c.req.valid("json") as AuthorUpdate;

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);
    await service.updateAuthor(id, input);
    return c.json({ success: true, id });
  })
  // 作成者の削除
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);
    await service.deleteAuthor(id);
    return c.json({ success: true });
  });
