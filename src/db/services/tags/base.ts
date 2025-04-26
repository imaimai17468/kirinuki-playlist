import type { DbClient } from "@/db/config/hono";
import { videoTags } from "@/db/models/relations";
import { tags } from "@/db/models/tags";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "@/db/utils/errors";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { TagBase, TagInsert, TagUpdate, TagWithVideos } from "./types";

export const createBaseTagService = (dbClient: DbClient) => ({
  // 内部使用のメソッド（関連動画なし）
  async _getTagsWithoutVideos(): Promise<TagBase[]> {
    try {
      return await dbClient.select().from(tags).all();
    } catch (_) {
      throw new DatabaseError("タグ一覧の取得に失敗しました");
    }
  },

  // 内部使用のメソッド（関連動画なし）
  async _getTagByIdWithoutVideos(id: string): Promise<TagBase> {
    try {
      const tag = await dbClient.select().from(tags).where(eq(tags.id, id)).get();

      if (!tag) {
        throw new NotFoundError(`ID: ${id} のタグが見つかりません`);
      }

      return tag;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `タグの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async getAllTags(): Promise<TagWithVideos[]> {
    try {
      const allTags = await this._getTagsWithoutVideos();

      const tagsWithVideos = await Promise.all(
        allTags.map(async (tag) => {
          return this.getTagById(tag.id);
        }),
      );

      return tagsWithVideos;
    } catch (error) {
      throw new DatabaseError(
        `タグ一覧の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async getTagById(_id: string): Promise<TagWithVideos> {
    try {
      // 関連動画データを取得するため、このメソッドは features/relations.ts に移動する
      throw new Error("このメソッドは relations サービスに実装されています");
    } catch (_error) {
      throw new DatabaseError("未実装のメソッドが呼び出されました");
    }
  },

  async createTag(data: TagInsert): Promise<string> {
    // 現在の日時
    const now = new Date();

    // nanoidを生成
    const id = nanoid();

    try {
      // データベースに挿入
      await dbClient.insert(tags).values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new UniqueConstraintError("このタグ名はすでに使用されています");
        }

        throw new DatabaseError("タグの保存中にエラーが発生しました");
      }

      throw error;
    }
  },

  async updateTag(id: string, data: TagUpdate): Promise<void> {
    try {
      // まず、タグが存在するか確認
      const tag = await dbClient.select().from(tags).where(eq(tags.id, id)).get();

      if (!tag) {
        throw new NotFoundError(`ID: ${id} のタグが見つかりません`);
      }

      // 更新データの準備（updatedAtは自動的に現在時刻に設定）
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      // データベースを更新
      await dbClient.update(tags).set(updateData).where(eq(tags.id, id)).run();
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new UniqueConstraintError("このタグ名はすでに使用されています");
        }

        throw new DatabaseError(`タグの更新中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  async deleteTag(id: string): Promise<void> {
    try {
      // まず、タグが存在するか確認
      const tag = await dbClient.select().from(tags).where(eq(tags.id, id)).get();

      if (!tag) {
        throw new NotFoundError(`ID: ${id} のタグが見つかりません`);
      }

      // トランザクションを開始
      await dbClient.transaction(async (tx) => {
        // タグに関連する動画の関連付けを削除
        await tx.delete(videoTags).where(eq(videoTags.tagId, id)).run();

        // タグを削除
        await tx.delete(tags).where(eq(tags.id, id)).run();
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`タグの削除中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },
});
