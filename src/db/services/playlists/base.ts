import type { DbClient } from "@/db/config/hono";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authors } from "../../models/authors";
import { playlists } from "../../models/playlists";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../../utils/errors";
import type { PlaylistInsert, PlaylistUpdate, PlaylistWithAuthor } from "./types";

export const createBasePlaylistService = (dbClient: DbClient) => ({
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
});
