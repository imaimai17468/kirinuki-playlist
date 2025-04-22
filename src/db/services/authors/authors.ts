import type { DbClient } from "@/db/config/hono";
import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authors } from "../../models/authors";
import { follows } from "../../models/follows";
import { playlists } from "../../models/playlists";
import { videos } from "../../models/videos";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../../utils/errors";
import { createPlaylistBookmarkService } from "../playlist_bookmarks/playlist_bookmarks";
import type { PlaylistWithAuthorAndVideos } from "../playlists/playlists";
import { createPlaylistService } from "../playlists/playlists";
import { createVideoBookmarkService } from "../video_bookmarks/video_bookmarks";
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

// 著者とフォロワー数・投稿数を含む拡張型
export type AuthorWithCounts = Author & {
  followerCount: number;
  videoCount: number;
  playlistCount: number;
};

// 著者と関連データ＋カウント情報を含む拡張型
export type AuthorWithVideosPlaylistsAndCounts = AuthorWithVideosAndPlaylists & {
  followerCount: number;
  videoCount: number;
  playlistCount: number;
};

// 著者とブックマークした動画を含む拡張型
export type AuthorWithBookmarkedVideos = Author & {
  bookmarkedVideos: VideoWithTagsAndAuthor[];
};

// 著者とブックマークしたプレイリストを含む拡張型
export type AuthorWithBookmarkedPlaylists = Author & {
  bookmarkedPlaylists: PlaylistWithAuthorAndVideos[];
};

// 著者と動画・プレイリスト・ブックマークを含む完全拡張型
export type AuthorWithVideosPlaylistsAndBookmarks = AuthorWithVideosAndPlaylists & {
  bookmarkedVideos: VideoWithTagsAndAuthor[];
  bookmarkedPlaylists: PlaylistWithAuthorAndVideos[];
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

  async getAllAuthorsWithCounts(): Promise<AuthorWithCounts[]> {
    try {
      // 著者一覧を取得
      const authorsList = await dbClient.select().from(authors).all();

      // 各著者の追加情報を並列で取得
      const authorsWithCounts = await Promise.all(
        authorsList.map(async (author) => {
          // フォロワー数
          const followers = await dbClient.select().from(follows).where(eq(follows.followingId, author.id)).all();
          const followerCount = followers.length;

          // 動画数
          const authorVideos = await dbClient.select().from(videos).where(eq(videos.authorId, author.id)).all();
          const videoCount = authorVideos.length;

          // プレイリスト数
          const authorPlaylists = await dbClient
            .select()
            .from(playlists)
            .where(eq(playlists.authorId, author.id))
            .all();
          const playlistCount = authorPlaylists.length;

          return {
            ...author,
            followerCount,
            videoCount,
            playlistCount,
          };
        }),
      );

      return authorsWithCounts;
    } catch (error) {
      throw new DatabaseError(
        `著者一覧とカウント情報の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
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

  async getAuthorWithCounts(id: string): Promise<AuthorWithCounts> {
    try {
      // 著者の基本情報を取得
      const author = await this.getAuthorById(id);

      // フォロワー数を取得
      const followers = await dbClient.select().from(follows).where(eq(follows.followingId, id)).all();
      const followerCount = followers.length;

      // 動画数を取得
      const authorVideos = await dbClient.select().from(videos).where(eq(videos.authorId, id)).all();
      const videoCount = authorVideos.length;

      // プレイリスト数を取得
      const authorPlaylists = await dbClient.select().from(playlists).where(eq(playlists.authorId, id)).all();
      const playlistCount = authorPlaylists.length;

      return {
        ...author,
        followerCount,
        videoCount,
        playlistCount,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者とカウント情報の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
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

  async getAuthorWithVideosPlaylistsAndCounts(id: string): Promise<AuthorWithVideosPlaylistsAndCounts> {
    try {
      // 著者の情報と動画・プレイリストを取得
      const authorWithData = await this.getAuthorWithVideosAndPlaylists(id);

      // フォロワー数を取得
      const followers = await dbClient.select().from(follows).where(eq(follows.followingId, id)).all();
      const followerCount = followers.length;

      return {
        ...authorWithData,
        followerCount,
        videoCount: authorWithData.videos.length,
        playlistCount: authorWithData.playlists.length,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者の全データの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async getAuthorWithBookmarkedVideos(id: string): Promise<AuthorWithBookmarkedVideos> {
    try {
      // 著者の基本情報を取得
      const author = await this.getAuthorById(id);

      // 著者がブックマークした動画を取得
      const videoBookmarkService = createVideoBookmarkService(dbClient);
      const bookmarkedVideos = await videoBookmarkService.getBookmarksByAuthorId(id);

      return {
        ...author,
        bookmarkedVideos,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者とブックマーク情報の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async getAuthorWithBookmarkedPlaylists(id: string): Promise<AuthorWithBookmarkedPlaylists> {
    try {
      // 著者の基本情報を取得
      const author = await this.getAuthorById(id);

      // 著者がブックマークしたプレイリストを取得
      const playlistBookmarkService = createPlaylistBookmarkService(dbClient);
      const bookmarkedPlaylists = await playlistBookmarkService.getBookmarksByAuthorId(id);

      return {
        ...author,
        bookmarkedPlaylists,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者とブックマークプレイリスト情報の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async bookmarkVideo(authorId: string, videoId: string): Promise<void> {
    try {
      // 著者の存在を確認
      await this.getAuthorById(authorId);

      // ブックマークサービスを使用してブックマークを作成
      const videoBookmarkService = createVideoBookmarkService(dbClient);
      await videoBookmarkService.createBookmark(authorId, videoId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof UniqueConstraintError) {
        throw error;
      }
      throw new DatabaseError(
        `動画のブックマーク中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async unbookmarkVideo(authorId: string, videoId: string): Promise<void> {
    try {
      // 著者の存在を確認
      await this.getAuthorById(authorId);

      // ブックマークサービスを使用してブックマークを削除
      const videoBookmarkService = createVideoBookmarkService(dbClient);
      await videoBookmarkService.deleteBookmark(authorId, videoId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `動画のブックマーク解除中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async hasBookmarkedVideo(authorId: string, videoId: string): Promise<boolean> {
    try {
      // 著者の存在を確認
      await this.getAuthorById(authorId);

      // ブックマーク状態を確認
      const videoBookmarkService = createVideoBookmarkService(dbClient);
      return await videoBookmarkService.hasBookmarked(authorId, videoId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `ブックマーク状態の確認中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async bookmarkPlaylist(authorId: string, playlistId: string): Promise<void> {
    try {
      // 著者の存在を確認
      await this.getAuthorById(authorId);

      // ブックマークサービスを使用してブックマークを作成
      const playlistBookmarkService = createPlaylistBookmarkService(dbClient);
      await playlistBookmarkService.createBookmark(authorId, playlistId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof UniqueConstraintError) {
        throw error;
      }
      throw new DatabaseError(
        `プレイリストのブックマーク中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async unbookmarkPlaylist(authorId: string, playlistId: string): Promise<void> {
    try {
      // 著者の存在を確認
      await this.getAuthorById(authorId);

      // ブックマークサービスを使用してブックマークを削除
      const playlistBookmarkService = createPlaylistBookmarkService(dbClient);
      await playlistBookmarkService.deleteBookmark(authorId, playlistId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `プレイリストのブックマーク解除中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async hasBookmarkedPlaylist(authorId: string, playlistId: string): Promise<boolean> {
    try {
      // 著者の存在を確認
      await this.getAuthorById(authorId);

      // ブックマーク状態を確認
      const playlistBookmarkService = createPlaylistBookmarkService(dbClient);
      return await playlistBookmarkService.hasBookmarked(authorId, playlistId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `プレイリストブックマーク状態の確認中にエラーが発生しました: ${
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

  async getAuthorWithVideosPlaylistsAndBookmarks(id: string): Promise<AuthorWithVideosPlaylistsAndBookmarks> {
    try {
      // 著者の基本情報と動画・プレイリストを取得
      const authorWithData = await this.getAuthorWithVideosAndPlaylists(id);

      // 著者がブックマークした動画を取得
      const videoBookmarkService = createVideoBookmarkService(dbClient);
      const bookmarkedVideos = await videoBookmarkService.getBookmarksByAuthorId(id);

      // 著者がブックマークしたプレイリストを取得
      const playlistBookmarkService = createPlaylistBookmarkService(dbClient);
      const bookmarkedPlaylists = await playlistBookmarkService.getBookmarksByAuthorId(id);

      return {
        ...authorWithData,
        bookmarkedVideos,
        bookmarkedPlaylists,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者の全データ（ブックマーク含む）の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },
});
