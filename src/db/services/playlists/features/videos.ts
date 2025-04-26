import type { DbClient } from "@/db/config/hono";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { playlistVideos } from "../../../models/relations";
import { videos } from "../../../models/videos";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../../../utils/errors";
import type { PlaylistVideoInsert, PlaylistVideoUpdate } from "../types";
import type { BasePlaylistService } from "../types-internal";

export const createVideosPlaylistService = (dbClient: DbClient, baseService: BasePlaylistService) => ({
  async addVideoToPlaylist(playlistId: string, videoData: PlaylistVideoInsert): Promise<void> {
    try {
      // プレイリストが存在するか確認
      await baseService.getPlaylistById(playlistId);

      // 動画が存在するか確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, videoData.videoId)).get();
      if (!video) {
        throw new NotFoundError(`ID: ${videoData.videoId} の動画が見つかりません`);
      }

      // 現在の日時
      const now = new Date();

      // 関連付け
      await dbClient.insert(playlistVideos).values({
        id: nanoid(),
        playlistId,
        videoId: videoData.videoId,
        order: videoData.order,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new UniqueConstraintError("この動画はすでに追加されています");
        }

        throw new DatabaseError(`プレイリストへの動画追加中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  async removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
    try {
      // プレイリストが存在するか確認
      await baseService.getPlaylistById(playlistId);

      // 動画が存在するか確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, videoId)).get();
      if (!video) {
        throw new NotFoundError(`動画 ${videoId} が見つかりません`);
      }

      // プレイリストと動画の関連付けを削除
      await dbClient
        .delete(playlistVideos)
        .where(and(eq(playlistVideos.playlistId, playlistId), eq(playlistVideos.videoId, videoId)))
        .run();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`プレイリストからの動画削除中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  async updatePlaylistVideo(playlistId: string, videoId: string, data: PlaylistVideoUpdate): Promise<void> {
    try {
      // プレイリストの存在確認
      await baseService.getPlaylistById(playlistId);

      // 動画の存在確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, videoId)).get();
      if (!video) {
        throw new NotFoundError(`動画 (ID: ${videoId}) が見つかりません`);
      }

      // プレイリストと動画の関連付けの存在確認
      const relation = await dbClient
        .select()
        .from(playlistVideos)
        .where(and(eq(playlistVideos.playlistId, playlistId), eq(playlistVideos.videoId, videoId)))
        .get();

      if (!relation) {
        throw new NotFoundError(`プレイリスト (ID: ${playlistId}) には動画 (ID: ${videoId}) が含まれていません`);
      }

      // 更新データの準備
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      // 関連付けの更新
      await dbClient
        .update(playlistVideos)
        .set(updateData)
        .where(and(eq(playlistVideos.playlistId, playlistId), eq(playlistVideos.videoId, videoId)))
        .run();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`プレイリスト内の動画更新中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },
});
