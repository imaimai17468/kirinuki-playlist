// nanoidのCommonJS版をインポート
import { nanoid } from "nanoid/non-secure";
import { createDbClient } from "../../config/database";
import app from "../../index";
import type { Video } from "../../models";
import { videos } from "../../models/videos";
import type { Bindings } from "../../types";

// テスト用のデータ
const videoList: Video[] = [
  {
    id: nanoid(),
    title: "Learning Hono",
    url: "https://www.youtube.com/watch?v=1234567890",
    start: 0,
    end: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: nanoid(),
    title: "Watch the movie",
    url: "https://www.youtube.com/watch?v=1234567890",
    start: 0,
    end: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: nanoid(),
    title: "Buy milk",
    url: "https://www.youtube.com/watch?v=1234567890",
    start: 0,
    end: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("Videos API", () => {
  let env: Bindings;

  // テスト前に環境を初期化
  beforeAll(async () => {
    env = await getMiniflareBindings();

    // テーブルの作成を確認
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
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
    } catch (error) {
      console.error("テーブル作成エラー:", error);
    }
  });

  // テスト用のデータをシードする関数
  const seed = async () => {
    const client = createDbClient(env.DB);

    try {
      // テスト前にテーブルをクリア
      await client.delete(videos);
      // D1データベースに挿入
      for (const video of videoList) {
        // SQLiteの列名に合わせてデータを挿入
        await client.run(`
          INSERT INTO videos (id, title, url, start, end, created_at, updated_at)
          VALUES ('${video.id}', '${video.title}', '${video.url}', ${video.start}, ${
            video.end
          }, '${video.createdAt.toISOString()}', '${video.updatedAt.toISOString()}')
        `);
      }
    } catch (error) {
      console.error("シードエラー:", error);
    }
  };

  beforeEach(async () => {
    await seed();
  });

  test("Todo 一覧を取得する", async () => {
    // 完全なURLを使用（/api/videosに修正）
    const res = await app.fetch(new Request("http://localhost/api/videos"), env);
    expect(res.status).toBe(200);

    const responseData = await res.json();
    expect(responseData.success).toBe(true);

    const videos = responseData.videos as Video[];
    // 日付の形式が変わるため、IDとタイトルだけを比較
    expect(videos.length).toBe(videoList.length);
    videos.forEach((item, index) => {
      expect(item.id).toBe(videoList[index].id);
      expect(item.title).toBe(videoList[index].title);
    });
  });
});
