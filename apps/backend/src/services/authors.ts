import type { D1Database } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createDbClient } from "../config/database";
import { authors } from "../models/authors";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../utils/errors";

export type Author = InferSelectModel<typeof authors>;
export type AuthorInsert = Omit<InferInsertModel<typeof authors>, "id" | "createdAt" | "updatedAt">;
export type AuthorUpdate = Partial<Omit<InferInsertModel<typeof authors>, "id" | "createdAt" | "updatedAt">>;

export const authorService = {
  async getAllAuthors(db: D1Database): Promise<Author[]> {
    const client = createDbClient(db);
    try {
      return await client.select().from(authors).all();
    } catch (_) {
      throw new DatabaseError("著者一覧の取得に失敗しました");
    }
  },

  async getAuthorById(db: D1Database, id: string): Promise<Author> {
    const client = createDbClient(db);
    try {
      const author = await client.select().from(authors).where(eq(authors.id, id)).get();

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

  async createAuthor(db: D1Database, data: AuthorInsert): Promise<string> {
    const client = createDbClient(db);

    // 現在の日時
    const now = new Date();

    // nanoidを生成
    const id = nanoid();

    try {
      // データベースに挿入
      await client.insert(authors).values({
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

  async updateAuthor(db: D1Database, id: string, data: AuthorUpdate): Promise<void> {
    const client = createDbClient(db);

    try {
      // 更新データの準備（updatedAtは自動的に現在時刻に設定）
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      // データベースを更新
      const result = await client.update(authors).set(updateData).where(eq(authors.id, id)).run();

      // 影響を受けた行数が0の場合、リソースが存在しない
      if (result.meta.changes === 0) {
        throw new NotFoundError(`ID: ${id} の著者が見つかりません`);
      }
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

  async deleteAuthor(db: D1Database, id: string): Promise<void> {
    const client = createDbClient(db);

    try {
      // データベースから削除
      const result = await client.delete(authors).where(eq(authors.id, id)).run();

      // 影響を受けた行数が0の場合、リソースが存在しない
      if (result.meta.changes === 0) {
        throw new NotFoundError(`ID: ${id} の著者が見つかりません`);
      }
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
};
