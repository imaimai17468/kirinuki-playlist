import { createDbClient } from "@/db/config/database";
import type { AppEnv } from "@/db/config/hono";
import { playlistInsertSchema, playlistUpdateSchema } from "@/db/models/playlists";
import { createPlaylistService } from "@/db/services/playlists/playlists";
import type { PlaylistInsert, PlaylistUpdate, PlaylistVideoInsert } from "@/db/services/playlists/playlists";
import { NotFoundError } from "@/db/utils/errors";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export const playlistsRouter = new Hono<AppEnv>()
  // すべてのプレイリストを取得（動画情報も含む）
  .get("/", async (c) => {
    // DbClientをコンテキストから取得、なければ新規作成
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    try {
      const service = createPlaylistService(dbClient);
      const playlists = await service.getAllPlaylistsWithVideos();
      return c.json({ success: true, playlists });
    } catch (error) {
      console.error("プレイリスト一覧の取得に失敗しました:", error);
      return c.json({ success: false, message: "プレイリスト一覧の取得に失敗しました" }, 500);
    }
  })

  // IDで指定したプレイリストを取得
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    // DbClientをコンテキストから取得、なければ新規作成
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    try {
      const service = createPlaylistService(dbClient);
      const playlist = await service.getPlaylistWithVideosById(id);
      return c.json({ success: true, playlist });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Failed to get playlist:", error);
      return c.json({ success: false, message: "プレイリストの取得に失敗しました" }, 500);
    }
  })

  // 新しいプレイリストを作成
  .post("/", zValidator("json", playlistInsertSchema), async (c) => {
    const data = c.req.valid("json") as PlaylistInsert;

    // DbClientをコンテキストから取得、なければ新規作成
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    try {
      const service = createPlaylistService(dbClient);
      const id = await service.createPlaylist(data);
      return c.json({ success: true, id }, 201);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Failed to create playlist:", error);
      return c.json({ success: false, message: "プレイリストの作成に失敗しました" }, 500);
    }
  })

  // プレイリストを更新
  .patch("/:id", zValidator("json", playlistUpdateSchema), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json") as PlaylistUpdate;

    // DbClientをコンテキストから取得、なければ新規作成
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    try {
      const service = createPlaylistService(dbClient);
      await service.updatePlaylist(id, data);
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Failed to update playlist:", error);
      return c.json({ success: false, message: "プレイリストの更新に失敗しました" }, 500);
    }
  })

  // プレイリストを削除
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    // DbClientをコンテキストから取得、なければ新規作成
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    try {
      const service = createPlaylistService(dbClient);
      await service.deletePlaylist(id);
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Failed to delete playlist:", error);
      return c.json({ success: false, message: "プレイリストの削除に失敗しました" }, 500);
    }
  })

  // プレイリストに動画を追加
  .post("/:id/videos", async (c) => {
    const id = c.req.param("id");
    const data = (await c.req.json()) as PlaylistVideoInsert;

    // DbClientをコンテキストから取得、なければ新規作成
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    try {
      // サービス層に処理を委譲（存在チェックもサービス層で行う）
      const playlistService = createPlaylistService(dbClient);
      await playlistService.addVideoToPlaylist(id, data);
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Failed to add video to playlist:", error);
      return c.json({ success: false, message: "プレイリストへの動画追加に失敗しました" }, 500);
    }
  })

  // プレイリストから動画を削除
  .delete("/:playlistId/videos/:videoId", async (c) => {
    const playlistId = c.req.param("playlistId");
    const videoId = c.req.param("videoId");

    // DbClientをコンテキストから取得、なければ新規作成
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    try {
      const service = createPlaylistService(dbClient);
      await service.removeVideoFromPlaylist(playlistId, videoId);
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json({ success: false, message: error.message }, 404);
      }
      console.error("Failed to remove video from playlist:", error);
      return c.json({ success: false, message: "プレイリストからの動画削除に失敗しました" }, 500);
    }
  });
