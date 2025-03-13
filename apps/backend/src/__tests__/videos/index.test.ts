import app from "../../index";
import type { Video } from "../../models";
import type { Bindings } from "../../types";
import { type ApiResponse, seedVideos, setupDatabase } from "../helpers/db-setup";
import { videoList } from "../helpers/test-data";

describe("Videos API", () => {
  let env: Bindings;

  // テスト前に環境を初期化
  beforeAll(async () => {
    env = await getMiniflareBindings();
    await setupDatabase(env);
  });

  beforeEach(async () => {
    await seedVideos(env, videoList);
  });

  describe("GET /api/videos", () => {
    test("動画一覧を取得する", async () => {
      // 完全なURLを使用
      const res = await app.fetch(new Request("http://localhost/api/videos"), env);
      expect(res.status).toBe(200);

      const responseData = (await res.json()) as ApiResponse<Video[]>;
      expect(responseData.success).toBe(true);

      const videos = responseData.videos;
      // 日付の形式が変わるため、IDとタイトルだけを比較
      expect(videos.length).toBe(videoList.length);
      videos.forEach((item, index) => {
        expect(item.id).toBe(videoList[index].id);
        expect(item.title).toBe(videoList[index].title);
      });
    });
  });

  // 将来的に他のエンドポイントのテストを追加する場合は、
  // 以下のようにdescribeブロックでグループ化する
  /*
  describe("GET /api/videos/:id", () => {
    test("特定の動画を取得する", async () => {
      // テストコード
    });
  });

  describe("POST /api/videos", () => {
    test("新しい動画を作成する", async () => {
      // テストコード
    });
  });

  describe("PATCH /api/videos/:id", () => {
    test("動画を更新する", async () => {
      // テストコード
    });
  });

  describe("DELETE /api/videos/:id", () => {
    test("動画を削除する", async () => {
      // テストコード
    });
  });
  */
});
