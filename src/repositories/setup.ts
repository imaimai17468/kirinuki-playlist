import { setApiClient } from "@/db/config/client";
import { createHonoApp } from "@/db/config/hono";
import type { DbClient } from "@/db/config/hono";
import { createTestDbClient } from "@/db/config/test-database";
import { authors } from "@/db/models/authors";
import { follows } from "@/db/models/follows";
import { playlistBookmarks } from "@/db/models/playlist_bookmarks";
import { playlists } from "@/db/models/playlists";
import { playlistVideos, videoTags } from "@/db/models/relations";
import { tags } from "@/db/models/tags";
import { videoBookmarks } from "@/db/models/video_bookmarks";
import { videos } from "@/db/models/videos";
import { setTestMode } from "@/repositories/auth";
import { testClient } from "hono/testing";
import { nanoid } from "nanoid";

/**
 * リポジトリテスト用の環境をセットアップする
 * - テスト用DBクライアントとHonoアプリ作成
 * - 必要なテストデータの挿入
 * - APIクライアントにtestClientをセット
 */
export async function setupTestEnv() {
  // テストモードを有効化して固定ユーザーIDを使用
  setTestMode(true);

  // テスト用のDBクライアントを作成
  const dbClient = await createTestDbClient();

  // テスト用Honoアプリを作成
  const app = createHonoApp({
    dbClient,
  });

  // テスト用クライアントを作成
  const client = testClient(app);

  // 全てのテストデータをクリア
  await dbClient.delete(videoBookmarks).run();
  await dbClient.delete(playlistBookmarks).run();
  await dbClient.delete(videoTags).run();
  await dbClient.delete(playlistVideos).run();
  await dbClient.delete(follows).run();
  await dbClient.delete(playlists).run();
  await dbClient.delete(videos).run();
  await dbClient.delete(tags).run();
  await dbClient.delete(authors).run();

  // APIクライアントを設定
  setApiClient(client);

  return {
    dbClient,
    app,
    client,
  };
}

// Honoモックレスポンス用に拡張されたビデオと著者の型
interface ExtendedVideo {
  id: string;
  title: string;
  url: string;
  start: number;
  end: number;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  // モックレスポンス用の追加プロパティ
  author?: {
    id: string;
    name: string;
    iconUrl: string;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  tags?: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }[];
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
    {
      id: "author3",
      name: "テスト著者3",
      iconUrl: "https://example.com/icon3.jpg",
      bio: "テスト著者3の説明",
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
  const testVideos: ExtendedVideo[] = [
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

  // ビデオデータを挿入 (tagsフィールドは挿入時に除外)
  for (const video of testVideos) {
    const { tags, ...videoData } = video;
    await dbClient.insert(videos).values(videoData);
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
 * テスト用のタグデータを挿入する
 */
export async function insertTestTags(dbClient: DbClient) {
  // テストタグデータ
  const testTags = [
    {
      id: "tag1",
      name: "テストタグ1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "tag2",
      name: "テストタグ2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // タグデータを挿入
  for (const tag of testTags) {
    await dbClient.insert(tags).values(tag);
  }

  return testTags;
}

/**
 * テスト用の動画-タグ関連付けデータを挿入する
 */
export async function insertTestVideoTags(dbClient: DbClient) {
  // テスト動画-タグ関連付けデータ
  const testVideoTags = [
    {
      videoId: "video1",
      tagId: "tag1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      videoId: "video1",
      tagId: "tag2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      videoId: "video2",
      tagId: "tag1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 動画-タグ関連付けデータを挿入
  for (const relation of testVideoTags) {
    await dbClient.insert(videoTags).values(relation);
  }

  return testVideoTags;
}

/**
 * テスト用のフォロー関係データを挿入する
 */
export async function insertTestFollows(dbClient: DbClient) {
  // テストフォロー関係データ
  const testFollows = [
    {
      followerId: "author1",
      followingId: "author2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      followerId: "author2",
      followingId: "author1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // フォロー関係データを挿入
  for (const relation of testFollows) {
    await dbClient.insert(follows).values(relation);
  }

  return testFollows;
}

/**
 * テスト用のビデオブックマークデータを挿入する
 */
export async function insertTestVideoBookmarks(dbClient: DbClient) {
  // テストビデオブックマークデータ
  const testVideoBookmarks = [
    {
      id: nanoid(),
      authorId: "author1",
      videoId: "video1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      authorId: "author2",
      videoId: "video1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      authorId: "author1",
      videoId: "video2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // ビデオブックマークデータを挿入
  for (const bookmark of testVideoBookmarks) {
    await dbClient.insert(videoBookmarks).values(bookmark);
  }

  return testVideoBookmarks;
}

/**
 * テスト用のプレイリストブックマークデータを挿入する
 */
export async function insertTestPlaylistBookmarks(dbClient: DbClient) {
  // テストプレイリストブックマークデータ
  const testPlaylistBookmarks = [
    {
      id: nanoid(),
      authorId: "author1",
      playlistId: "playlist2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(),
      authorId: "author2",
      playlistId: "playlist1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // プレイリストブックマークデータを挿入
  for (const bookmark of testPlaylistBookmarks) {
    await dbClient.insert(playlistBookmarks).values(bookmark);
  }

  return testPlaylistBookmarks;
}

/**
 * テスト実行後のクリーンアップ
 */
export async function cleanupTestData(dbClient: DbClient) {
  await dbClient.delete(videoBookmarks).run();
  await dbClient.delete(playlistBookmarks).run();
  await dbClient.delete(videoTags).run();
  await dbClient.delete(playlistVideos).run();
  await dbClient.delete(follows).run();
  await dbClient.delete(playlists).run();
  await dbClient.delete(videos).run();
  await dbClient.delete(tags).run();
  await dbClient.delete(authors).run();
}

/**
 * 全テストデータをセットアップする
 * - 著者、タグ、動画、プレイリスト、関連付けの順に挿入
 */
export async function insertAllTestData(dbClient: DbClient) {
  const authors = await insertTestAuthors(dbClient);
  const tagsData = await insertTestTags(dbClient);
  const videos = await insertTestVideos(dbClient);
  const playlists = await insertTestPlaylists(dbClient);
  const follows = await insertTestFollows(dbClient);
  const playlistVideoRelations = await insertTestPlaylistVideos(dbClient);
  const videoTagRelations = await insertTestVideoTags(dbClient);
  const videoBookmarks = await insertTestVideoBookmarks(dbClient);
  const playlistBookmarks = await insertTestPlaylistBookmarks(dbClient);

  return {
    authors,
    tags: tagsData,
    videos,
    playlists,
    follows,
    playlistVideoRelations,
    videoTagRelations,
    videoBookmarks,
    playlistBookmarks,
  };
}
