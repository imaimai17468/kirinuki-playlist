import type { DbClient } from "@/db/config/hono";
import { follows } from "@/db/models/follows";
import { playlists } from "@/db/models/playlists";
import { videos } from "@/db/models/videos";
import type {
  Author,
  AuthorWithCounts,
  AuthorWithVideosAndPlaylists,
  AuthorWithVideosPlaylistsAndCounts,
} from "@/db/services/authors/types";
import type { BaseAuthorService } from "@/db/services/authors/types-internal";
import { DatabaseError, NotFoundError } from "@/db/utils/errors";
import { eq } from "drizzle-orm";

export const createCountsAuthorService = (dbClient: DbClient, baseService: BaseAuthorService) => ({
  async getAllAuthorsWithCounts(): Promise<AuthorWithCounts[]> {
    try {
      // 著者一覧を取得
      const authorsList = await baseService.getAllAuthors();

      // 各著者の追加情報を並列で取得
      const authorsWithCounts = await Promise.all(
        authorsList.map(async (author: Author) => {
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

  async getAuthorWithCounts(id: string): Promise<AuthorWithCounts> {
    try {
      // 著者の基本情報を取得
      const author = await baseService.getAuthorById(id);

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

  async getAuthorWithVideosPlaylistsAndCounts(
    id: string,
    authorWithData: AuthorWithVideosAndPlaylists,
  ): Promise<AuthorWithVideosPlaylistsAndCounts> {
    try {
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
});
