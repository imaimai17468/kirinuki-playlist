import type { D1Database } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createDbClient, type createTestDbClient } from "../config/database";
import { authors } from "../models/authors";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../utils/errors";

export type Author = InferSelectModel<typeof authors>;
export type AuthorInsert = Omit<InferInsertModel<typeof authors>, "id" | "createdAt" | "updatedAt">;
export type AuthorUpdate = Partial<Omit<InferInsertModel<typeof authors>, "id" | "createdAt" | "updatedAt">>;

// データベースクライアントの型
// プロダクション環境(D1)とテスト環境(SQLite)の両方をサポート
export type DbClient = ReturnType<typeof createDbClient> | Awaited<ReturnType<typeof createTestDbClient>>;

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

// デフォルトのauthorServiceインスタンス（下位互換性のため）
export const authorService = {
  getAllAuthors: (db: D1Database) => {
    const client = createDbClient(db);
    return createAuthorService(client).getAllAuthors();
  },

  getAuthorById: (db: D1Database, id: string) => {
    const client = createDbClient(db);
    return createAuthorService(client).getAuthorById(id);
  },

  createAuthor: (db: D1Database, data: AuthorInsert) => {
    const client = createDbClient(db);
    return createAuthorService(client).createAuthor(data);
  },

  updateAuthor: (db: D1Database, id: string, data: AuthorUpdate) => {
    const client = createDbClient(db);
    return createAuthorService(client).updateAuthor(id, data);
  },

  deleteAuthor: (db: D1Database, id: string) => {
    const client = createDbClient(db);
    return createAuthorService(client).deleteAuthor(id);
  },
};
