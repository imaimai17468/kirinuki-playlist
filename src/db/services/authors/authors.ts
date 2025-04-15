import type { DbClient } from "@/db/config/hono";
import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authors } from "../../models/authors";
import { playlists } from "../../models/playlists";
import { videos } from "../../models/videos";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../../utils/errors";
import type { PlaylistWithAuthorAndVideos } from "../playlists/playlists";
import { createPlaylistService } from "../playlists/playlists";
import type { VideoWithTagsAndAuthor } from "../videos/videos";
import { createVideoService } from "../videos/videos";

export type Author = InferSelectModel<typeof authors>;
export type AuthorInsert = Omit<InferInsertModel<typeof authors>, "id" | "createdAt" | "updatedAt">;
export type AuthorUpdate = Partial<Omit<InferInsertModel<typeof authors>, "id" | "createdAt" | "updatedAt">>;

// 著者と関連動画を含む拡張型
export type AuthorWithVideos = Author & {
  videos: VideoWithTagsAndAuthor[];
};

// 著者と関連プレイリストを含む拡張型
export type AuthorWithPlaylists = Author & {
  playlists: PlaylistWithAuthorAndVideos[];
};

// 著者と関連動画・プレイリストを含む拡張型
export type AuthorWithVideosAndPlaylists = Author & {
  videos: VideoWithTagsAndAuthor[];
  playlists: PlaylistWithAuthorAndVideos[];
};

// 依存性注入パターンを使った著者サービスの作成関数
export const createAuthorService = (dbClient: DbClient) => ({
  async getAllAuthors(): Promise<Author[]> {
    try {
      return await dbClient.select().from(authors).all();
    } catch (_) {
      throw new DatabaseError("著者一覧の取得に失敗しました");
    }
  },

  async getAuthorById(id: string): Promise<Author> {
    try {
      const author = await dbClient.select().from(authors).where(eq(authors.id, id)).get();

      if (!author) {
        throw new NotFoundError(`ID: ${id} の著者が見つかりません`);
      }

      return author;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async getAuthorWithVideos(id: string): Promise<AuthorWithVideos> {
    try {
      // 著者の情報を取得
      const author = await this.getAuthorById(id);

      // 著者に関連する動画を取得
      const videoService = createVideoService(dbClient);
      const authorVideos = await dbClient.select().from(videos).where(eq(videos.authorId, id)).all();

      // 各動画の詳細情報（タグ情報を含む）を取得
      const videosWithDetails = await Promise.all(authorVideos.map((video) => videoService.getVideoById(video.id)));

      return {
        ...author,
        videos: videosWithDetails,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者と動画の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async getAuthorWithPlaylists(id: string): Promise<AuthorWithPlaylists> {
    try {
      // 著者の情報を取得
      const author = await this.getAuthorById(id);

      // 著者に関連するプレイリストを取得
      const playlistService = createPlaylistService(dbClient);
      const authorPlaylists = await dbClient.select().from(playlists).where(eq(playlists.authorId, id)).all();

      // 各プレイリストの詳細情報（動画情報を含む）を取得
      const playlistsWithDetails = await Promise.all(
        authorPlaylists.map((playlist) => playlistService.getPlaylistWithVideosById(playlist.id)),
      );

      return {
        ...author,
        playlists: playlistsWithDetails,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者とプレイリストの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async getAuthorWithVideosAndPlaylists(id: string): Promise<AuthorWithVideosAndPlaylists> {
    try {
      // 著者の情報を取得
      const author = await this.getAuthorById(id);

      // 著者に関連する動画とプレイリストを並行して取得
      const videoService = createVideoService(dbClient);
      const playlistService = createPlaylistService(dbClient);

      const authorVideos = await dbClient.select().from(videos).where(eq(videos.authorId, id)).all();
      const authorPlaylists = await dbClient.select().from(playlists).where(eq(playlists.authorId, id)).all();

      // 各動画とプレイリストの詳細情報を取得
      const [videosWithDetails, playlistsWithDetails] = await Promise.all([
        Promise.all(authorVideos.map((video) => videoService.getVideoById(video.id))),
        Promise.all(authorPlaylists.map((playlist) => playlistService.getPlaylistWithVideosById(playlist.id))),
      ]);

      return {
        ...author,
        videos: videosWithDetails,
        playlists: playlistsWithDetails,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者の動画とプレイリストの取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async createAuthor(data: AuthorInsert): Promise<string> {
    // 現在の日時
    const now = new Date();

    // nanoidを生成
    const id = nanoid();

    try {
      // データベースに挿入
      await dbClient.insert(authors).values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new UniqueConstraintError("この著者IDはすでに使用されています");
        }

        throw new DatabaseError("著者の保存中にエラーが発生しました");
      }

      throw error;
    }
  },

  async updateAuthor(id: string, data: AuthorUpdate): Promise<void> {
    try {
      // 更新データの準備（updatedAtは自動的に現在時刻に設定）
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      // まず、著者が存在するか確認
      const author = await dbClient.select().from(authors).where(eq(authors.id, id)).get();

      if (!author) {
        throw new NotFoundError(`ID: ${id} の著者が見つかりません`);
      }

      // データベースを更新
      await dbClient.update(authors).set(updateData).where(eq(authors.id, id)).run();
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`著者の更新中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  async deleteAuthor(id: string): Promise<void> {
    try {
      // まず、著者が存在するか確認
      const author = await dbClient.select().from(authors).where(eq(authors.id, id)).get();

      if (!author) {
        throw new NotFoundError(`ID: ${id} の著者が見つかりません`);
      }

      // データベースから削除
      await dbClient.delete(authors).where(eq(authors.id, id)).run();
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`著者の削除中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },
});
