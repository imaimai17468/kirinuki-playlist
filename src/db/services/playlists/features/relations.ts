import type { DbClient } from "@/db/config/hono";
import { eq } from "drizzle-orm";
import { authors } from "../../../models/authors";
import { playlistVideos, videoTags } from "../../../models/relations";
import { tags } from "../../../models/tags";
import { videos } from "../../../models/videos";
import { DatabaseError, NotFoundError } from "../../../utils/errors";
import type { PlaylistWithAuthorAndVideos } from "../types";
import type { BasePlaylistService } from "../types-internal";

export const createRelationsPlaylistService = (dbClient: DbClient, baseService: BasePlaylistService) => ({
  async getPlaylistWithVideosById(id: string): Promise<PlaylistWithAuthorAndVideos> {
    try {
      // まずプレイリスト情報を取得
      const playlist = await baseService.getPlaylistById(id);

      // 次にこのプレイリストに含まれる動画を取得
      const playlistVideosResult = await dbClient
        .select()
        .from(playlistVideos)
        .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
        .innerJoin(authors, eq(videos.authorId, authors.id))
        .where(eq(playlistVideos.playlistId, id))
        .orderBy(playlistVideos.order)
        .all();

      // 動画情報をマッピング - まず基本情報を抽出
      const videosWithAuthors = await Promise.all(
        playlistVideosResult.map(async (row) => {
          // 各動画のタグ情報を取得
          const videoTagsResult = await dbClient
            .select()
            .from(videoTags)
            .innerJoin(tags, eq(videoTags.tagId, tags.id))
            .where(eq(videoTags.videoId, row.videos.id))
            .all();

          return {
            id: row.videos.id,
            title: row.videos.title,
            url: row.videos.url,
            start: row.videos.start,
            end: row.videos.end,
            authorId: row.videos.authorId,
            order: row.playlist_videos.order,
            createdAt: row.videos.createdAt,
            updatedAt: row.videos.updatedAt,
            author: {
              id: row.authors.id,
              name: row.authors.name,
              iconUrl: row.authors.iconUrl,
              bio: row.authors.bio,
              createdAt: row.authors.createdAt,
              updatedAt: row.authors.updatedAt,
            },
            // タグ情報を追加
            tags: videoTagsResult.map((tagRow) => tagRow.tags),
          };
        }),
      );

      // プレイリスト情報と動画情報を組み合わせて返す
      return {
        ...playlist,
        videos: videosWithAuthors,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `プレイリストと動画情報の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async getAllPlaylistsWithVideos(): Promise<PlaylistWithAuthorAndVideos[]> {
    try {
      // まずプレイリスト一覧を取得
      const playlists = await baseService.getAllPlaylists();

      // 各プレイリストに対して動画情報を取得
      const playlistsWithVideos = await Promise.all(
        playlists.map(async (playlist) => {
          try {
            return await this.getPlaylistWithVideosById(playlist.id);
          } catch (error) {
            // 個別のプレイリストでエラーが発生しても全体の取得は続行
            console.error(`ID: ${playlist.id} のプレイリスト動画取得に失敗:`, error);
            return {
              ...playlist,
              videos: [],
            };
          }
        }),
      );

      return playlistsWithVideos;
    } catch (error) {
      throw new DatabaseError(
        `プレイリスト一覧と動画情報の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },
});
