import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { runMigrationWithLibSqlServer } from "./migrate";

// 必要なデータモデルをインポート
import { authors, follows, playlistVideos, playlists, tags, videoTags, videos } from "../src/db/models";

/**
 * データベースの既存データをクリーンアップします
 * @param url libsqlサーバーのURL
 */
async function cleanupDatabase(url: string) {
  console.log(`[cleanup] ${url}の既存データを削除中...`);

  // データベースに接続
  const client = createClient({
    url,
  });
  const db = drizzle(client);

  try {
    // 関連テーブルから順番に削除
    await db.delete(videoTags);
    await db.delete(playlistVideos);
    await db.delete(follows);
    await db.delete(videos);
    await db.delete(playlists);
    await db.delete(tags);
    await db.delete(authors);

    console.log("[cleanup] データの削除が完了しました");
  } catch (error) {
    console.error("[cleanup] データ削除中にエラーが発生しました:", error);
    throw error;
  }
}

/**
 * シードデータをデータベースに挿入します
 * @param url libsqlサーバーのURL
 */
async function seedDatabase(url: string) {
  console.log(`[seed] ${url}にシードデータを挿入中...`);

  // データベースに接続
  const client = createClient({
    url,
  });
  const db = drizzle(client);

  const now = new Date();

  try {
    // 作者データの挿入
    console.log("[seed] 作者データを挿入中...");
    const authorIds = await db
      .insert(authors)
      .values([
        {
          id: nanoid(),
          name: "テスト作者1",
          iconUrl: "https://i.pravatar.cc/150?img=1",
          bio: "テスト用の作者プロフィールです。",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: nanoid(),
          name: "テスト作者2",
          iconUrl: "https://i.pravatar.cc/150?img=2",
          bio: "2人目のテスト作者です。",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "user_2vLSMWubQtjuQaEOg1BKAgbPvVu",
          name: "Toshiki Imai",
          iconUrl:
            "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydkxTTVZCaEUzQTc5Rm5xQlhtVk16Y2ZTNmYifQ?width=128",
          bio: "",
          createdAt: now,
          updatedAt: now,
        },
      ])
      .returning({ id: authors.id });

    // タグデータの挿入
    console.log("[seed] タグデータを挿入中...");
    const tagIds = await db
      .insert(tags)
      .values([
        {
          id: nanoid(),
          name: "音楽",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: nanoid(),
          name: "プログラミング",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: nanoid(),
          name: "ゲーム",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: nanoid(),
          name: "エンターテイメント",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: nanoid(),
          name: "教育",
          createdAt: now,
          updatedAt: now,
        },
      ])
      .returning({ id: tags.id });

    // 動画データの挿入
    console.log("[seed] 動画データを挿入中...");
    const videoIds = await db
      .insert(videos)
      .values([
        {
          id: nanoid(),
          title: "テスト動画1",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          start: 0,
          end: 30,
          authorId: authorIds[0].id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: nanoid(),
          title: "テスト動画2",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          start: 30,
          end: 60,
          authorId: authorIds[0].id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: nanoid(),
          title: "テスト動画3",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          start: 60,
          end: 90,
          authorId: authorIds[1].id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: nanoid(),
          title: "タグなし動画",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          start: 90,
          end: 120,
          authorId: authorIds[0].id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: nanoid(),
          title: "多数タグ動画",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          start: 120,
          end: 150,
          authorId: authorIds[1].id,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .returning({ id: videos.id });

    // ビデオ-タグ関連データの挿入
    console.log("[seed] ビデオ-タグ関連データを挿入中...");
    await db.insert(videoTags).values([
      {
        videoId: videoIds[0].id,
        tagId: tagIds[0].id,
        createdAt: now,
        updatedAt: now,
      },
      {
        videoId: videoIds[0].id,
        tagId: tagIds[1].id,
        createdAt: now,
        updatedAt: now,
      },
      {
        videoId: videoIds[1].id,
        tagId: tagIds[1].id,
        createdAt: now,
        updatedAt: now,
      },
      {
        videoId: videoIds[2].id,
        tagId: tagIds[2].id,
        createdAt: now,
        updatedAt: now,
      },
      // 多数タグ動画のタグ関連付け
      {
        videoId: videoIds[4].id,
        tagId: tagIds[0].id, // 音楽
        createdAt: now,
        updatedAt: now,
      },
      {
        videoId: videoIds[4].id,
        tagId: tagIds[1].id, // プログラミング
        createdAt: now,
        updatedAt: now,
      },
      {
        videoId: videoIds[4].id,
        tagId: tagIds[2].id, // ゲーム
        createdAt: now,
        updatedAt: now,
      },
      {
        videoId: videoIds[4].id,
        tagId: tagIds[3].id, // エンターテイメント
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // プレイリストデータの挿入
    console.log("[seed] プレイリストデータを挿入中...");
    const playlistIds = await db
      .insert(playlists)
      .values([
        {
          id: nanoid(),
          title: "テストプレイリスト1",
          authorId: authorIds[0].id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: nanoid(),
          title: "テストプレイリスト2",
          authorId: authorIds[1].id,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .returning({ id: playlists.id });

    // プレイリスト動画関連データの挿入
    console.log("[seed] プレイリスト動画関連データを挿入中...");
    await db.insert(playlistVideos).values([
      {
        id: nanoid(),
        playlistId: playlistIds[0].id,
        videoId: videoIds[0].id,
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: nanoid(),
        playlistId: playlistIds[0].id,
        videoId: videoIds[1].id,
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: nanoid(),
        playlistId: playlistIds[1].id,
        videoId: videoIds[2].id,
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // フォロー関係データの挿入
    console.log("[seed] フォロー関係データを挿入中...");
    await db.insert(follows).values([
      {
        followerId: authorIds[0].id,
        followingId: authorIds[1].id,
        createdAt: now,
        updatedAt: now,
      },
      {
        followerId: authorIds[1].id,
        followingId: authorIds[0].id,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log("[seed] シードデータの挿入が完了しました");
  } catch (error) {
    console.error("[seed] シードデータ挿入中にエラーが発生しました:", error);
    throw error;
  }
}

async function main() {
  try {
    const url = process.env.LIBSQL_URL || "http://localhost:8080";

    // オプション: 先にマイグレーションを実行してからシードデータを挿入
    const shouldRunMigrationFirst = process.argv.includes("--with-migration");
    if (shouldRunMigrationFirst) {
      console.log("マイグレーションを先に実行します");
      await runMigrationWithLibSqlServer(url);
    }

    // データをクリーンアップ
    await cleanupDatabase(url);

    // シードデータを挿入
    await seedDatabase(url);
  } catch (error) {
    console.error("シードデータ挿入中にエラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみmain()を呼び出す
if (require.main === module) {
  main().catch(console.error);
}

// 他のファイルからインポートできるようにエクスポート
export { seedDatabase, cleanupDatabase };
