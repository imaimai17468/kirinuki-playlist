import { eq } from "drizzle-orm";
import type { drizzle } from "drizzle-orm/bun-sqlite";
import { nanoid } from "nanoid";
import { type Result, err, ok } from "neverthrow";
import { authors } from "../../db/models/authors";
import type { ApiError } from "../types";

// DBクライアントの型を定義
type DB = ReturnType<typeof drizzle>;

type Author = typeof authors.$inferSelect;
type AuthorCreate = {
  name: string;
  iconUrl: string;
  bio?: string | null;
};
type AuthorUpdate = Partial<AuthorCreate>;

/**
 * 著者リポジトリ
 * データベース操作を抽象化し、Result型を返す
 */
export const authorRepository = {
  /**
   * 全ての著者を取得
   */
  async findAll(db: DB): Promise<Result<Author[], ApiError>> {
    try {
      const result = await db.select().from(authors).all();
      return ok(result);
    } catch (error) {
      return err({
        type: "serverError",
        message: `著者一覧の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      });
    }
  },

  /**
   * IDで著者を検索
   */
  async findById(db: DB, id: string): Promise<Result<Author, ApiError>> {
    try {
      const result = await db.select().from(authors).where(eq(authors.id, id)).get();

      if (!result) {
        return err({
          type: "notFound",
          message: `ID: ${id} の著者が見つかりません`,
        });
      }

      return ok(result);
    } catch (error) {
      return err({
        type: "serverError",
        message: `著者の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      });
    }
  },

  /**
   * 新しい著者を作成
   */
  async create(db: DB, data: AuthorCreate): Promise<Result<string, ApiError>> {
    try {
      const now = new Date();
      const id = nanoid();

      await db.insert(authors).values({
        id,
        name: data.name,
        iconUrl: data.iconUrl,
        bio: data.bio ?? null,
        createdAt: now,
        updatedAt: now,
      });

      return ok(id);
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
        return err({
          type: "badRequest",
          message: "この著者IDはすでに使用されています",
        });
      }

      return err({
        type: "serverError",
        message: `著者の作成中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      });
    }
  },

  /**
   * 著者情報を更新
   */
  async update(db: DB, id: string, data: AuthorUpdate): Promise<Result<void, ApiError>> {
    try {
      // 更新前に存在確認
      const existingResult = await this.findById(db, id);
      if (existingResult.isErr()) {
        // エラーの型を修正して返す
        return err(existingResult.error);
      }

      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await db.update(authors).set(updateData).where(eq(authors.id, id)).run();

      // 既に存在確認をしているので、ここでは成功を返す
      return ok(undefined);
    } catch (error) {
      return err({
        type: "serverError",
        message: `著者の更新中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      });
    }
  },

  /**
   * 著者を削除
   */
  async delete(db: DB, id: string): Promise<Result<void, ApiError>> {
    try {
      // 削除前に存在確認
      const existingResult = await this.findById(db, id);
      if (existingResult.isErr()) {
        // エラーの型を修正して返す
        return err(existingResult.error);
      }

      await db.delete(authors).where(eq(authors.id, id)).run();

      // 既に存在確認をしているので、ここでは成功を返す
      return ok(undefined);
    } catch (error) {
      return err({
        type: "serverError",
        message: `著者の削除中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      });
    }
  },
};
