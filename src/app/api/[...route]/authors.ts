import { createDbClient } from "@/db/config/database";
import type { AppEnv } from "@/db/config/hono";
import { authorInsertSchema, authorUpdateSchema } from "@/db/models/authors";
import { createAuthorService } from "@/db/services/authors/authors";
import type { AuthorInsert, AuthorUpdate } from "@/db/services/authors/authors";
import { NotFoundError, UniqueConstraintError } from "@/db/utils/errors";
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
  withBookmarks: z
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
      withBookmarks = false,
    } = c.req.valid("query");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);

    // 動画・プレイリスト・ブックマーク情報を全て取得する場合
    if (withVideosAndPlaylists && withBookmarks) {
      const authorWithAll = await service.getAuthorWithVideosPlaylistsAndBookmarks(id);
      return c.json({ success: true, author: authorWithAll });
    }

    // 全ての情報を取得する場合
    if (withVideosAndPlaylists && withCounts) {
      const authorWithAll = await service.getAuthorWithVideosPlaylistsAndCounts(id);
      return c.json({ success: true, author: authorWithAll });
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
  })
  // ブックマーク関連のエンドポイントを追加
  .get("/:id/bookmarked-videos", async (c) => {
    const id = c.req.param("id");

    try {
      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createAuthorService(dbClient);
      const author = await service.getAuthorWithBookmarkedVideos(id);
      return c.json({ success: true, author });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, error: error.message }, 404);
      }
      console.error("著者のブックマーク取得エラー:", error);
      return c.json(
        {
          success: false,
          error: "著者のブックマーク取得中にエラーが発生しました",
        },
        500,
      );
    }
  })
  // 動画をブックマークする
  .post("/:id/bookmarks/videos/:videoId", async (c) => {
    const authorId = c.req.param("id");
    const videoId = c.req.param("videoId");

    try {
      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createAuthorService(dbClient);
      await service.bookmarkVideo(authorId, videoId);
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, error: error.message }, 404);
      }
      if (error instanceof UniqueConstraintError) {
        return c.json({ success: false, error: error.message }, 409);
      }
      console.error("動画ブックマークエラー:", error);
      return c.json({ success: false, error: "動画のブックマーク中にエラーが発生しました" }, 500);
    }
  })
  // 動画のブックマークを解除する
  .delete("/:id/bookmarks/videos/:videoId", async (c) => {
    const authorId = c.req.param("id");
    const videoId = c.req.param("videoId");

    try {
      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createAuthorService(dbClient);
      await service.unbookmarkVideo(authorId, videoId);
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, error: error.message }, 404);
      }
      console.error("動画ブックマーク解除エラー:", error);
      return c.json(
        {
          success: false,
          error: "動画のブックマーク解除中にエラーが発生しました",
        },
        500,
      );
    }
  })
  // 動画のブックマーク状態を確認する
  .get("/:id/bookmarks/videos/:videoId", async (c) => {
    const authorId = c.req.param("id");
    const videoId = c.req.param("videoId");

    try {
      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createAuthorService(dbClient);
      const isBookmarked = await service.hasBookmarkedVideo(authorId, videoId);
      return c.json({ success: true, isBookmarked });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, error: error.message }, 404);
      }
      console.error("ブックマーク状態確認エラー:", error);
      return c.json(
        {
          success: false,
          error: "ブックマーク状態の確認中にエラーが発生しました",
        },
        500,
      );
    }
  })
  // プレイリストのブックマーク関連のエンドポイントを追加
  .get("/:id/bookmarked-playlists", async (c) => {
    const id = c.req.param("id");

    try {
      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createAuthorService(dbClient);
      const author = await service.getAuthorWithBookmarkedPlaylists(id);
      return c.json({ success: true, author });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, error: error.message }, 404);
      }
      console.error("著者のプレイリストブックマーク取得エラー:", error);
      return c.json(
        {
          success: false,
          error: "著者のプレイリストブックマーク取得中にエラーが発生しました",
        },
        500,
      );
    }
  })
  // プレイリストをブックマークする
  .post("/:id/bookmarks/playlists/:playlistId", async (c) => {
    const authorId = c.req.param("id");
    const playlistId = c.req.param("playlistId");

    try {
      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createAuthorService(dbClient);
      await service.bookmarkPlaylist(authorId, playlistId);
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, error: error.message }, 404);
      }
      if (error instanceof UniqueConstraintError) {
        return c.json({ success: false, error: error.message }, 409);
      }
      console.error("プレイリストブックマークエラー:", error);
      return c.json(
        {
          success: false,
          error: "プレイリストのブックマーク中にエラーが発生しました",
        },
        500,
      );
    }
  })
  // プレイリストのブックマークを解除する
  .delete("/:id/bookmarks/playlists/:playlistId", async (c) => {
    const authorId = c.req.param("id");
    const playlistId = c.req.param("playlistId");

    try {
      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createAuthorService(dbClient);
      await service.unbookmarkPlaylist(authorId, playlistId);
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, error: error.message }, 404);
      }
      console.error("プレイリストブックマーク解除エラー:", error);
      return c.json(
        {
          success: false,
          error: "プレイリストのブックマーク解除中にエラーが発生しました",
        },
        500,
      );
    }
  })
  // プレイリストのブックマーク状態を確認する
  .get("/:id/bookmarks/playlists/:playlistId", async (c) => {
    const authorId = c.req.param("id");
    const playlistId = c.req.param("playlistId");

    try {
      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createAuthorService(dbClient);
      const isBookmarked = await service.hasBookmarkedPlaylist(authorId, playlistId);
      return c.json({ success: true, isBookmarked });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, error: error.message }, 404);
      }
      console.error("プレイリストブックマーク状態確認エラー:", error);
      return c.json(
        {
          success: false,
          error: "プレイリストブックマーク状態の確認中にエラーが発生しました",
        },
        500,
      );
    }
  })
  // 新しいエンドポイントを追加
  .get("/:id/all-with-bookmarks", async (c) => {
    const id = c.req.param("id");

    try {
      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createAuthorService(dbClient);
      const author = await service.getAuthorWithVideosPlaylistsAndBookmarks(id);
      return c.json({ success: true, author });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, error: error.message }, 404);
      }
      console.error("著者の全データ（ブックマーク含む）取得エラー:", error);
      return c.json(
        {
          success: false,
          error: "著者の全データ（ブックマーク含む）取得中にエラーが発生しました",
        },
        500,
      );
    }
  });
