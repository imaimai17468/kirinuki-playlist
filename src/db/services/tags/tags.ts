import type { DbClient } from "@/db/config/hono";
import { eq, inArray } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authors } from "../../models/authors";
import { videoTags } from "../../models/relations";
import { tags } from "../../models/tags";
import { videos } from "../../models/videos";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../../utils/errors";

// 基本的なタグの型
export type TagBase = InferSelectModel<typeof tags>;

// 動画情報を含むタグの型（公開用）
export type TagWithVideos = TagBase & {
  videos: {
    id: string;
    title: string;
    url: string;
    start: number | null;
    end: number | null;
    authorId: string;
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
    tags: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }[];
};

export type TagInsert = Omit<InferInsertModel<typeof tags>, "id" | "createdAt" | "updatedAt">;

export type TagUpdate = Partial<Omit<InferInsertModel<typeof tags>, "id" | "createdAt" | "updatedAt">>;

// 依存性注入パターンを使ったタグサービスの作成関数
export const createTagService = (dbClient: DbClient) => ({
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

  // 公開APIメソッド（関連動画情報あり）
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

  // 公開APIメソッド（関連動画情報あり）
  async getTagById(id: string): Promise<TagWithVideos> {
    try {
      const tag = await this._getTagByIdWithoutVideos(id);

      // タグに関連する動画を取得
      const videoTagsResult = await dbClient
        .select()
        .from(videoTags)
        .innerJoin(videos, eq(videoTags.videoId, videos.id))
        .where(eq(videoTags.tagId, id))
        .all();

      // 動画の著者情報とタグ情報を含める
      const videosWithAuthor = await Promise.all(
        videoTagsResult.map(async (row) => {
          // 著者情報の取得
          const author = await dbClient.select().from(authors).where(eq(authors.id, row.videos.authorId)).get();

          if (!author) {
            throw new NotFoundError(`ID: ${row.videos.authorId} の著者が見つかりません`);
          }

          // 動画に関連するタグ情報の取得
          const tagResults = await dbClient
            .select()
            .from(videoTags)
            .innerJoin(tags, eq(videoTags.tagId, tags.id))
            .where(eq(videoTags.videoId, row.videos.id))
            .all();

          // タグデータを抽出して整形
          const relatedTags = tagResults.map((result) => ({
            id: result.tags.id,
            name: result.tags.name,
            createdAt: result.tags.createdAt,
            updatedAt: result.tags.updatedAt,
          }));

          return {
            ...row.videos,
            author: author,
            tags: relatedTags,
          };
        }),
      );

      return {
        ...tag,
        videos: videosWithAuthor,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `タグの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
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

  // 複数のタグIDで動画を取得
  async getVideosByTagIds(tagIds: string[]): Promise<string[]> {
    if (tagIds.length === 0) {
      return [];
    }

    try {
      // 指定されたタグを持つビデオIDを取得
      const videoIdsWithTags = await dbClient
        .select()
        .from(videoTags)
        .where(tagIds.length === 1 ? eq(videoTags.tagId, tagIds[0]) : inArray(videoTags.tagId, tagIds))
        .groupBy(videoTags.videoId)
        .all();

      return videoIdsWithTags.map((row) => row.videoId);
    } catch (error) {
      throw new DatabaseError(
        `タグによる動画IDの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  // 指定した複数のタグをすべて持つ動画IDを取得
  async getVideosByAllTags(tagIds: string[]): Promise<string[]> {
    if (tagIds.length === 0) {
      return [];
    }

    try {
      // 各タグごとに動画IDを取得し、共通するIDのみを抽出
      const results = await Promise.all(
        tagIds.map(async (tagId) => {
          const videoTagsResult = await dbClient.select().from(videoTags).where(eq(videoTags.tagId, tagId)).all();
          return videoTagsResult.map((row) => row.videoId);
        }),
      );

      // すべてのタグに共通する動画IDを抽出（セット演算）
      if (results.length === 0) return [];

      let commonVideoIds = results[0];
      for (let i = 1; i < results.length; i++) {
        commonVideoIds = commonVideoIds.filter((id) => results[i].includes(id));
      }

      return commonVideoIds;
    } catch (error) {
      throw new DatabaseError(
        `複数タグによる共通動画の検索中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },
});
