import { createDbClient } from "@/db/config/database";
import type { AppEnv } from "@/db/config/hono";
import { authorInsertSchema, authorUpdateSchema } from "@/db/models/authors";
import { createAuthorService } from "@/db/services/authors/authors";
import type { AuthorInsert, AuthorUpdate } from "@/db/services/authors/authors";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// クエリパラメータのバリデーションスキーマ
const authorQuerySchema = z.object({
  withVideos: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  withPlaylists: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  withVideosAndPlaylists: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  withCounts: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
});

// 一覧取得用のクエリパラメータのバリデーションスキーマ
const authorsListQuerySchema = z.object({
  withCounts: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
});

export const authorsRouter = new Hono<AppEnv>()
  // 作成者一覧の取得
  .get("/", zValidator("query", authorsListQuerySchema), async (c) => {
    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);
    const { withCounts = false } = c.req.valid("query");

    if (withCounts) {
      // カウント情報を含む著者一覧を取得
      const authorsWithCounts = await service.getAllAuthorsWithCounts();
      return c.json({ success: true, authors: authorsWithCounts });
    }

    // 通常の著者一覧を取得
    const authors = await service.getAllAuthors();
    return c.json({ success: true, authors });
  })
  // 作成者の詳細取得
  .get("/:id", zValidator("query", authorQuerySchema), async (c) => {
    const id = c.req.param("id");
    const {
      withVideos = false,
      withPlaylists = false,
      withVideosAndPlaylists = false,
      withCounts = false,
    } = c.req.valid("query");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);

    // 全ての情報を取得する場合
    if (withVideosAndPlaylists && withCounts) {
      const authorWithAll = await service.getAuthorWithVideosPlaylistsAndCounts(id);
      return c.json({ success: true, author: authorWithAll });
    }

    // 動画とプレイリストの両方を取得する場合
    if (withVideosAndPlaylists) {
      const authorWithAll = await service.getAuthorWithVideosAndPlaylists(id);
      return c.json({ success: true, author: authorWithAll });
    }

    // カウント情報のみを取得する場合
    if (withCounts) {
      const authorWithCounts = await service.getAuthorWithCounts(id);
      return c.json({ success: true, author: authorWithCounts });
    }

    // 動画情報を取得する場合
    if (withVideos) {
      const authorWithVideos = await service.getAuthorWithVideos(id);
      return c.json({ success: true, author: authorWithVideos });
    }

    // プレイリスト情報を取得する場合
    if (withPlaylists) {
      const authorWithPlaylists = await service.getAuthorWithPlaylists(id);
      return c.json({ success: true, author: authorWithPlaylists });
    }

    // デフォルトは基本情報のみ
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
