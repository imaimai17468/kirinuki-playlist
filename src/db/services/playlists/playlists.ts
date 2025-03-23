import type { DbClient } from "@/db/config/hono";
import { and, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authors } from "../../models/authors";
import { type Playlist, playlists } from "../../models/playlists";
import { playlistVideos } from "../../models/relations";
import { videos } from "../../models/videos";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../../utils/errors";

// 著者情報を含むプレイリストの型
export type PlaylistWithAuthor = Playlist & {
  author: {
    id: string;
    name: string;
    iconUrl: string;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export type PlaylistWithAuthorAndVideos = PlaylistWithAuthor & {
  videos: {
    id: string;
    title: string;
    url: string;
    start: number | null;
    end: number | null;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string;
      iconUrl: string;
      bio: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
};

export type PlaylistInsert = Omit<InferInsertModel<typeof playlists>, "id" | "createdAt" | "updatedAt">;

export type PlaylistUpdate = Partial<Omit<InferInsertModel<typeof playlists>, "id" | "createdAt" | "updatedAt">>;

export type PlaylistVideoInsert = {
  videoId: string;
  order: number;
};

// 依存性注入パターンを使ったプレイリストサービスの作成関数
export const createPlaylistService = (dbClient: DbClient) => ({
  async getAllPlaylists(): Promise<PlaylistWithAuthor[]> {
    try {
      // プレイリスト一覧を取得
      const results = await dbClient
        .select()
        .from(playlists)
        .innerJoin(authors, eq(playlists.authorId, authors.id))
        .all();

      return results.map((row) => ({
        id: row.playlists.id,
        title: row.playlists.title,
        authorId: row.playlists.authorId,
        createdAt: row.playlists.createdAt,
        updatedAt: row.playlists.updatedAt,
        author: {
          id: row.authors.id,
          name: row.authors.name,
          iconUrl: row.authors.iconUrl,
          bio: row.authors.bio,
          createdAt: row.authors.createdAt,
          updatedAt: row.authors.updatedAt,
        },
      }));
    } catch (error) {
      throw new DatabaseError(
        `プレイリスト一覧の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async getPlaylistById(id: string): Promise<PlaylistWithAuthor> {
    try {
      // プレイリストを取得
      const result = await dbClient
        .select()
        .from(playlists)
        .innerJoin(authors, eq(playlists.authorId, authors.id))
        .where(eq(playlists.id, id))
        .get();

      if (!result) {
        throw new NotFoundError(`ID: ${id} のプレイリストが見つかりません`);
      }

      return {
        id: result.playlists.id,
        title: result.playlists.title,
        authorId: result.playlists.authorId,
        createdAt: result.playlists.createdAt,
        updatedAt: result.playlists.updatedAt,
        author: {
          id: result.authors.id,
          name: result.authors.name,
          iconUrl: result.authors.iconUrl,
          bio: result.authors.bio,
          createdAt: result.authors.createdAt,
          updatedAt: result.authors.updatedAt,
        },
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

  async getPlaylistWithVideosById(id: string): Promise<PlaylistWithAuthorAndVideos> {
    try {
      // まずプレイリスト情報を取得
      const playlist = await this.getPlaylistById(id);

      // 次にこのプレイリストに含まれる動画を取得
      const playlistVideosResult = await dbClient
        .select()
        .from(playlistVideos)
        .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
        .innerJoin(authors, eq(videos.authorId, authors.id))
        .where(eq(playlistVideos.playlistId, id))
        .orderBy(playlistVideos.order)
        .all();

      // 動画情報をマッピング
      const videosWithAuthors = playlistVideosResult.map((row) => ({
        id: row.videos.id,
        title: row.videos.title,
        url: row.videos.url,
        start: row.videos.start,
        end: row.videos.end,
        authorId: row.videos.authorId,
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
      }));

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

  async createPlaylist(data: PlaylistInsert): Promise<string> {
    // 現在の日時
    const now = new Date();

    // IDの生成
    const id = nanoid();

    try {
      // 著者が存在するか確認
      const author = await dbClient.select().from(authors).where(eq(authors.id, data.authorId)).get();
      if (!author) {
        throw new NotFoundError(`ID: ${data.authorId} の著者が見つかりません`);
      }

      // プレイリストの挿入
      await dbClient.insert(playlists).values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      return id;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new UniqueConstraintError("このプレイリストIDはすでに使用されています");
        }

        throw new DatabaseError(`プレイリストの作成中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  async updatePlaylist(id: string, data: PlaylistUpdate): Promise<void> {
    try {
      // authorIdが含まれている場合、著者が存在するか確認
      if (data.authorId) {
        const author = await dbClient.select().from(authors).where(eq(authors.id, data.authorId)).get();
        if (!author) {
          throw new NotFoundError(`ID: ${data.authorId} の著者が見つかりません`);
        }
      }

      // まず、プレイリストが存在するか確認
      const playlist = await dbClient.select().from(playlists).where(eq(playlists.id, id)).get();

      if (!playlist) {
        throw new NotFoundError(`ID: ${id} のプレイリストが見つかりません`);
      }

      // 更新データの準備
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      // プレイリストの更新
      await dbClient.update(playlists).set(updateData).where(eq(playlists.id, id)).run();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`プレイリストの更新中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  async deletePlaylist(id: string): Promise<void> {
    try {
      // まず、プレイリストが存在するか確認
      const playlist = await dbClient.select().from(playlists).where(eq(playlists.id, id)).get();

      if (!playlist) {
        throw new NotFoundError(`ID: ${id} のプレイリストが見つかりません`);
      }

      // プレイリストを削除
      await dbClient.delete(playlists).where(eq(playlists.id, id)).run();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`プレイリストの削除中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  async addVideoToPlaylist(playlistId: string, videoData: PlaylistVideoInsert): Promise<void> {
    try {
      // プレイリストが存在するか確認
      const playlist = await dbClient.select().from(playlists).where(eq(playlists.id, playlistId)).get();
      if (!playlist) {
        throw new NotFoundError(`ID: ${playlistId} のプレイリストが見つかりません`);
      }

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
      // 関連するプレイリストか動画が存在しない場合
      const playlist = await dbClient.select().from(playlists).where(eq(playlists.id, playlistId)).get();
      if (!playlist) {
        throw new NotFoundError(`プレイリスト ${playlistId} が見つかりません`);
      }

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

  async getAllPlaylistsWithVideos(): Promise<PlaylistWithAuthorAndVideos[]> {
    try {
      // まずプレイリスト一覧を取得
      const playlists = await this.getAllPlaylists();

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
