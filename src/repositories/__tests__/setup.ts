import { setApiClient } from "@/db/config/client";
import { createHonoApp } from "@/db/config/hono";
import type { DbClient } from "@/db/config/hono";
import { createTestDbClient } from "@/db/config/test-database";
import { authors } from "@/db/models/authors";
import { playlists } from "@/db/models/playlists";
import { playlistVideos } from "@/db/models/relations";
import { videos } from "@/db/models/videos";
import { testClient } from "hono/testing";
import { nanoid } from "nanoid";

/**
 * リポジトリテスト用の環境をセットアップする
 * - テスト用DBクライアントとHonoアプリ作成
 * - 必要なテストデータの挿入
 * - APIクライアントにtestClientをセット
 */
export async function setupTestEnv() {
  // テスト用のDBクライアントを作成
  const dbClient = await createTestDbClient();

  // テスト用Honoアプリを作成
  const app = createHonoApp({
    dbClient,
  });

  // テスト用クライアントを作成
  const client = testClient(app);

  // 全てのテストデータをクリア
  await dbClient.delete(playlistVideos).run();
  await dbClient.delete(playlists).run();
  await dbClient.delete(videos).run();
  await dbClient.delete(authors).run();

  // APIクライアントを設定
  setApiClient(client);

  return {
    dbClient,
    app,
    client,
  };
}

/**
 * テスト用の著者データを挿入する
 */
export async function insertTestAuthors(dbClient: DbClient) {
  // テスト著者データ
  const testAuthors = [
    {
      id: "author1",
      name: "テスト著者1",
      iconUrl: "https://example.com/icon1.jpg",
      bio: "テスト著者1の説明",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "author2",
      name: "テスト著者2",
      iconUrl: "https://example.com/icon2.jpg",
      bio: "テスト著者2の説明",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 著者データを挿入
  for (const author of testAuthors) {
    await dbClient.insert(authors).values(author);
  }

  return testAuthors;
}

/**
 * テスト用のビデオデータを挿入する
 */
export async function insertTestVideos(dbClient: DbClient) {
  // テストビデオデータ
  const testVideos = [
    {
      id: "video1",
      title: "テストビデオ1",
      url: "https://example.com/video1",
      start: 0,
      end: 60,
      authorId: "author1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "video2",
      title: "テストビデオ2",
      url: "https://example.com/video2",
      start: 30,
      end: 120,
      authorId: "author2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // ビデオデータを挿入
  for (const video of testVideos) {
    await dbClient.insert(videos).values(video);
  }

  return testVideos;
}

/**
 * テスト用のプレイリストデータを挿入する
 */
export async function insertTestPlaylists(dbClient: DbClient) {
  // テストプレイリストデータ
  const testPlaylists = [
    {
      id: "playlist1",
      title: "テストプレイリスト1",
      authorId: "author1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "playlist2",
      title: "テストプレイリスト2",
      authorId: "author2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // プレイリストデータを挿入
  for (const playlist of testPlaylists) {
    await dbClient.insert(playlists).values(playlist);
  }

  return testPlaylists;
}

/**
 * テスト用のプレイリスト-動画関連付けデータを挿入する
 */
export async function insertTestPlaylistVideos(dbClient: DbClient) {
  // テストプレイリスト-動画関連付けデータ
  const testPlaylistVideos = [
    {
      id: nanoid(),
      playlistId: "playlist1",
      videoId: "video1",
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      playlistId: "playlist1",
      videoId: "video2",
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      playlistId: "playlist2",
      videoId: "video2",
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // プレイリスト-動画関連付けデータを挿入
  for (const relation of testPlaylistVideos) {
    await dbClient.insert(playlistVideos).values(relation);
  }

  return testPlaylistVideos;
}

/**
 * テスト実行後のクリーンアップ
 */
export async function cleanupTestData(dbClient: DbClient) {
  await dbClient.delete(playlistVideos).run();
  await dbClient.delete(playlists).run();
  await dbClient.delete(videos).run();
  await dbClient.delete(authors).run();
}

/**
 * 全テストデータをセットアップする
 * - 著者、動画、プレイリスト、関連付けの順に挿入
 */
export async function insertAllTestData(dbClient: DbClient) {
  const authors = await insertTestAuthors(dbClient);
  const videos = await insertTestVideos(dbClient);
  const playlists = await insertTestPlaylists(dbClient);
  const relations = await insertTestPlaylistVideos(dbClient);

  return {
    authors,
    videos,
    playlists,
    relations,
  };
}
