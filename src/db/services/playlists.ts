import type { D1Database } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createDbClient } from "../config/database";
import { authors } from "../models/authors";
import { playlists } from "../models/playlists";
import { playlistVideos } from "../models/relations";
import { videos } from "../models/videos";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../utils/errors";

// 基本的なプレイリストの型（内部使用のみ）
type PlaylistBase = InferSelectModel<typeof playlists>;

// 作成者情報を含むプレイリストの型（公開用）
export type Playlist = PlaylistBase & {
  author: {
    id: string;
    name: string;
    iconUrl: string;
    bio: string | null;
  };
  videos: {
    id: string;
    title: string;
    url: string;
    start: number;
    end: number;
    order: number;
  }[];
};

export type PlaylistInsert = Omit<InferInsertModel<typeof playlists>, "id" | "createdAt" | "updatedAt">;

export type PlaylistUpdate = Partial<Omit<InferInsertModel<typeof playlists>, "id" | "createdAt" | "updatedAt">>;

export const playlistService = {
  // 内部使用のメソッド（作成者情報なし）
  async _getPlaylistsWithoutAuthors(db: D1Database): Promise<PlaylistBase[]> {
    const client = createDbClient(db);
    try {
      return await client.select().from(playlists).all();
    } catch (_) {
      throw new DatabaseError("プレイリスト一覧の取得に失敗しました");
    }
  },

  // 内部使用のメソッド（作成者情報なし）
  async _getPlaylistByIdWithoutAuthor(db: D1Database, id: string): Promise<PlaylistBase> {
    const client = createDbClient(db);
    try {
      const playlist = await client.select().from(playlists).where(eq(playlists.id, id)).get();

      if (!playlist) {
        throw new NotFoundError(`ID: ${id} のプレイリストが見つかりません`);
      }

      return playlist;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `プレイリストの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  // 公開APIメソッド（作成者情報あり）
  async getAllPlaylists(db: D1Database): Promise<Playlist[]> {
    const client = createDbClient(db);
    try {
      // プレイリストと作成者の結合
      const results = await client
        .select({
          playlist: playlists,
          author: authors,
        })
        .from(playlists)
        .innerJoin(authors, eq(playlists.authorId, authors.id))
        .all();

      // 各プレイリストのビデオ情報を取得
      const playlistsWithVideos = await Promise.all(
        results.map(async (row) => {
          const playlistVideosResult = await client
            .select({
              video: videos,
              playlistVideo: playlistVideos,
            })
            .from(playlistVideos)
            .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
            .where(eq(playlistVideos.playlistId, row.playlist.id))
            .orderBy(playlistVideos.order)
            .all();

          return {
            id: row.playlist.id,
            title: row.playlist.title,
            authorId: row.playlist.authorId,
            createdAt: row.playlist.createdAt,
            updatedAt: row.playlist.updatedAt,
            author: {
              id: row.author.id,
              name: row.author.name,
              iconUrl: row.author.iconUrl,
              bio: row.author.bio,
            },
            videos: playlistVideosResult.map((pv) => ({
              id: pv.video.id,
              title: pv.video.title,
              url: pv.video.url,
              start: pv.video.start,
              end: pv.video.end,
              order: pv.playlistVideo.order,
            })),
          };
        }),
      );

      return playlistsWithVideos;
    } catch (error) {
      throw new DatabaseError(
        `プレイリスト一覧の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  // 公開APIメソッド（作成者情報あり）
  async getPlaylistById(db: D1Database, id: string): Promise<Playlist> {
    const client = createDbClient(db);
    try {
      // プレイリストと作成者の結合
      const result = await client
        .select({
          playlist: playlists,
          author: authors,
        })
        .from(playlists)
        .innerJoin(authors, eq(playlists.authorId, authors.id))
        .where(eq(playlists.id, id))
        .get();

      if (!result) {
        throw new NotFoundError(`ID: ${id} のプレイリストが見つかりません`);
      }

      // プレイリストのビデオ情報を取得
      const playlistVideosResult = await client
        .select({
          video: videos,
          playlistVideo: playlistVideos,
        })
        .from(playlistVideos)
        .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
        .where(eq(playlistVideos.playlistId, id))
        .orderBy(playlistVideos.order)
        .all();

      return {
        id: result.playlist.id,
        title: result.playlist.title,
        authorId: result.playlist.authorId,
        createdAt: result.playlist.createdAt,
        updatedAt: result.playlist.updatedAt,
        author: {
          id: result.author.id,
          name: result.author.name,
          iconUrl: result.author.iconUrl,
          bio: result.author.bio,
        },
        videos: playlistVideosResult.map((pv) => ({
          id: pv.video.id,
          title: pv.video.title,
          url: pv.video.url,
          start: pv.video.start,
          end: pv.video.end,
          order: pv.playlistVideo.order,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `プレイリストの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async createPlaylist(db: D1Database, data: PlaylistInsert): Promise<string> {
    const client = createDbClient(db);

    // 現在の日時
    const now = new Date();

    // nanoidを生成
    const id = nanoid();

    try {
      // 作成者が存在するか確認
      const author = await client.select().from(authors).where(eq(authors.id, data.authorId)).get();
      if (!author) {
        throw new NotFoundError(`ID: ${data.authorId} の作成者が見つかりません`);
      }

      // データベースに挿入
      await client.insert(playlists).values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      return id;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new UniqueConstraintError("このプレイリストIDはすでに使用されています");
        }

        throw new DatabaseError("プレイリストの保存中にエラーが発生しました");
      }

      throw error;
    }
  },

  async updatePlaylist(db: D1Database, id: string, data: PlaylistUpdate): Promise<void> {
    const client = createDbClient(db);

    try {
      // authorIdが含まれている場合、作成者が存在するか確認
      if (data.authorId) {
        const author = await client.select().from(authors).where(eq(authors.id, data.authorId)).get();
        if (!author) {
          throw new NotFoundError(`ID: ${data.authorId} の作成者が見つかりません`);
        }
      }

      // 更新データの準備（updatedAtは自動的に現在時刻に設定）
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      // データベースを更新
      const result = await client.update(playlists).set(updateData).where(eq(playlists.id, id)).run();

      // 影響を受けた行数が0の場合、リソースが存在しない
      if (result.meta.changes === 0) {
        throw new NotFoundError(`ID: ${id} のプレイリストが見つかりません`);
      }
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`プレイリストの更新中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  async deletePlaylist(db: D1Database, id: string): Promise<void> {
    const client = createDbClient(db);

    try {
      // プレイリストビデオの関連を削除
      await client.delete(playlistVideos).where(eq(playlistVideos.playlistId, id)).run();

      // プレイリストを削除
      const result = await client.delete(playlists).where(eq(playlists.id, id)).run();

      // 影響を受けた行数が0の場合、リソースが存在しない
      if (result.meta.changes === 0) {
        throw new NotFoundError(`ID: ${id} のプレイリストが見つかりません`);
      }
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`プレイリストの削除中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },
};
