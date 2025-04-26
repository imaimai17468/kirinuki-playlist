import type { DbClient } from "@/db/config/hono";
import { authors } from "@/db/models/authors";
import type { Author, AuthorInsert, AuthorUpdate } from "@/db/services/authors/types";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "@/db/utils/errors";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const createBaseAuthorService = (dbClient: DbClient) => ({
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
