import { createDbClient } from "../../config/database";
import type { Author } from "../../models/authors";
import { authors } from "../../models/authors";
import { videos } from "../../models/videos";
import type { Bindings } from "../../types";
import type { Video as TestVideo } from "./test-data";

// テーブルの作成
export const setupDatabase = async (env: Bindings): Promise<void> => {
  const client = createDbClient(env.DB);
  try {
    // テーブルが存在するか確認し、なければ作成
    await client.run(`
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        start INTEGER NOT NULL,
        end INTEGER NOT NULL,
        author_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (author_id) REFERENCES authors (id)
      )
    `);

    await client.run(`
      CREATE TABLE IF NOT EXISTS authors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon_url TEXT NOT NULL,
        bio TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  } catch (error) {
    console.error("テーブル作成エラー:", error);
  }
};

// テストデータのシード
export const seedVideos = async (env: Bindings, videoList: TestVideo[]): Promise<void> => {
  const client = createDbClient(env.DB);

  try {
    // テスト前にテーブルをクリア
    await client.delete(videos);
    // D1データベースに挿入
    for (const video of videoList) {
      // SQLiteの列名に合わせてデータを挿入
      await client.run(`
        INSERT INTO videos (id, title, url, start, end, author_id, created_at, updated_at)
        VALUES ('${video.id}', '${video.title}', '${video.url}', ${video.start}, ${video.end}, '${
          video.authorId
        }', '${video.createdAt.toISOString()}', '${video.updatedAt.toISOString()}')
      `);
    }
  } catch (error) {
    console.error("シードエラー:", error);
  }
};

// 著者テストデータのシード
export const seedAuthors = async (env: Bindings, authorList: Author[]): Promise<void> => {
  const client = createDbClient(env.DB);

  try {
    // テスト前にテーブルをクリア
    await client.delete(authors);
    // D1データベースに挿入
    for (const author of authorList) {
      // SQLiteの列名に合わせてデータを挿入
      await client.run(`
        INSERT INTO authors (id, name, icon_url, bio, created_at, updated_at)
        VALUES ('${author.id}', '${author.name}', '${author.iconUrl}', ${
          author.bio ? `'${author.bio}'` : "NULL"
        }, '${author.createdAt.toISOString()}', '${author.updatedAt.toISOString()}')
      `);
    }
  } catch (error) {
    console.error("著者シードエラー:", error);
  }
};

// レスポンスデータの型定義
export type ApiResponse<T> = {
  success: boolean;
  [key: string]: unknown;
  data?: T;
};

// ビデオ一覧のレスポンス型
export type VideoListResponse = {
  success: boolean;
  videos: TestVideo[];
};

// 単一ビデオのレスポンス型
export type VideoDetailResponse = {
  success: boolean;
  video: TestVideo;
};

// 著者一覧のレスポンス型
export type AuthorListResponse = {
  success: boolean;
  authors: Author[];
};

// 単一著者のレスポンス型
export type AuthorDetailResponse = {
  success: boolean;
  author: Author;
};

// ID返却のレスポンス型
export type IdResponse = {
  success: boolean;
  id: string;
  video?: TestVideo;
};

// 成功レスポンス型
export type SuccessResponse = {
  success: boolean;
};
