import { playlistInsertSchema, playlistUpdateSchema } from "@/db/models/playlists";
import { playlistService } from "@/db/services/playlists";
import type { PlaylistInsert, PlaylistUpdate } from "@/db/services/playlists";
import type { Bindings } from "@/db/types/bindings";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export const playlistsRouter = new Hono<{ Bindings: Bindings }>();

// プレイリスト一覧の取得（作成者情報とビデオ情報を含む）
playlistsRouter.get("/", async (c) => {
  const { DB } = getRequestContext().env;
  const playlists = await playlistService.getAllPlaylists(DB);
  return c.json({ success: true, playlists });
});

// プレイリストの詳細取得（作成者情報とビデオ情報を含む）
playlistsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const { DB } = getRequestContext().env;
  const playlist = await playlistService.getPlaylistById(DB, id);
  return c.json({ success: true, playlist });
});

// プレイリストの追加
playlistsRouter.post("/", zValidator("json", playlistInsertSchema), async (c) => {
  const input = c.req.valid("json") as PlaylistInsert;
  const { DB } = getRequestContext().env;
  const id = await playlistService.createPlaylist(DB, input);

  // 作成後、作成者情報とビデオ情報を含めて返す
  const playlist = await playlistService.getPlaylistById(DB, id);
  return c.json({ success: true, id, playlist }, 201);
});

// プレイリストの更新
playlistsRouter.patch("/:id", zValidator("json", playlistUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const input = c.req.valid("json") as PlaylistUpdate;
  const { DB } = getRequestContext().env;
  await playlistService.updatePlaylist(DB, id, input);

  // 更新後、作成者情報とビデオ情報を含めて返す
  const playlist = await playlistService.getPlaylistById(DB, id);
  return c.json({ success: true, id, playlist });
});

// プレイリストの削除
playlistsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const { DB } = getRequestContext().env;
  await playlistService.deletePlaylist(DB, id);
  return c.json({ success: true });
});
