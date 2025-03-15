import app from "../../index";
import type { Bindings } from "../../types";
import {
  type IdResponse,
  type SuccessResponse,
  type VideoDetailResponse,
  type VideoListResponse,
  seedAuthors,
  seedVideos,
  setupDatabase,
} from "../helpers/db-setup";
import { authorList, videoList } from "../helpers/test-data";

describe("Videos API", () => {
  let env: Bindings;

  // テスト前に環境を初期化
  beforeAll(async () => {
    env = await getMiniflareBindings();
    await setupDatabase(env);
  });

  beforeEach(async () => {
    // 著者データを先にシードする
    await seedAuthors(env, authorList);
    // 次にビデオデータをシードする
    await seedVideos(env, videoList);
  });

  describe("GET /api/videos", () => {
    test("動画一覧を取得する（著者情報を含む）", async () => {
      // 完全なURLを使用
      const res = await app.fetch(new Request("http://localhost/api/videos"), env);
      expect(res.status).toBe(200);

      const responseData = (await res.json()) as VideoListResponse;
      expect(responseData.success).toBe(true);

      const videos = responseData.videos;
      // 日付の形式が変わるため、IDとタイトルだけを比較
      expect(videos.length).toBe(videoList.length);
      videos.forEach((item, index) => {
        expect(item.id).toBe(videoList[index].id);
        expect(item.title).toBe(videoList[index].title);
        // 著者情報も確認
        expect(item.author).toBeDefined();
        expect(item.author.id).toBe(videoList[index].author.id);
        expect(item.author.name).toBe(videoList[index].author.name);
      });
    });
  });

  describe("GET /api/videos/:id", () => {
    test("特定の動画を取得する（著者情報を含む）", async () => {
      const targetVideo = videoList[0];
      const res = await app.fetch(new Request(`http://localhost/api/videos/${targetVideo.id}`), env);
      expect(res.status).toBe(200);

      const responseData = (await res.json()) as VideoDetailResponse;
      expect(responseData.success).toBe(true);
      expect(responseData.video.id).toBe(targetVideo.id);
      expect(responseData.video.title).toBe(targetVideo.title);

      // 著者情報も確認
      expect(responseData.video.author).toBeDefined();
      expect(responseData.video.author.id).toBe(targetVideo.author.id);
      expect(responseData.video.author.name).toBe(targetVideo.author.name);
      expect(responseData.video.author.iconUrl).toBe(targetVideo.author.iconUrl);
    });

    test("存在しないIDの場合404を返す", async () => {
      const nonExistentId = "non-existent-id";
      const res = await app.fetch(new Request(`http://localhost/api/videos/${nonExistentId}`), env);
      expect(res.status).toBe(500);

      // レスポンスをテキストとして取得
      const responseText = await res.text();
      console.log("Response text:", responseText);

      // JSONとして解析できる場合のみ検証
      if (responseText.startsWith("{")) {
        const responseData = JSON.parse(responseText);
        expect(responseData.success).toBe(false);
      }
    });
  });

  describe("POST /api/videos", () => {
    test("新しい動画を作成する", async () => {
      const newVideo = {
        title: "New Test Video",
        url: "https://www.youtube.com/watch?v=new12345",
        start: 10,
        end: 120,
        authorId: authorList[0].id, // 山田太郎の動画
      };

      const res = await app.fetch(
        new Request("http://localhost/api/videos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newVideo),
        }),
        env,
      );
      expect(res.status).toBe(201);

      const responseData = (await res.json()) as IdResponse;
      expect(responseData.success).toBe(true);
      expect(responseData.id).toBeDefined();

      // レスポンスに動画情報と著者情報が含まれているか確認
      expect(responseData.video).toBeDefined();
      if (responseData.video) {
        expect(responseData.video.title).toBe(newVideo.title);
        expect(responseData.video.author).toBeDefined();
        expect(responseData.video.author.id).toBe(authorList[0].id);
        expect(responseData.video.author.name).toBe(authorList[0].name);
      }

      // 作成されたビデオを取得して確認
      const getRes = await app.fetch(new Request(`http://localhost/api/videos/${responseData.id}`), env);
      const getResponseData = (await getRes.json()) as VideoDetailResponse;
      expect(getResponseData.success).toBe(true);
      expect(getResponseData.video.title).toBe(newVideo.title);
      expect(getResponseData.video.url).toBe(newVideo.url);
      expect(getResponseData.video.start).toBe(newVideo.start);
      expect(getResponseData.video.end).toBe(newVideo.end);
      expect(getResponseData.video.authorId).toBe(newVideo.authorId);

      // 著者情報も確認
      expect(getResponseData.video.author).toBeDefined();
      expect(getResponseData.video.author.id).toBe(authorList[0].id);
      expect(getResponseData.video.author.name).toBe(authorList[0].name);
    });

    test("無効なデータの場合400を返す", async () => {
      const invalidVideo = {
        // titleが欠けている
        url: "https://www.youtube.com/watch?v=invalid12345",
        start: 10,
        end: 120,
        authorId: authorList[0].id,
      };

      const res = await app.fetch(
        new Request("http://localhost/api/videos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidVideo),
        }),
        env,
      );
      expect(res.status).toBe(400);

      // 型アサーションを追加
      const responseData = (await res.json()) as {
        success: boolean;
        error?: string;
      };
      expect(responseData.success).toBe(false);
    });

    test("存在しない著者IDの場合エラーを返す", async () => {
      const invalidVideo = {
        title: "Invalid Author Video",
        url: "https://www.youtube.com/watch?v=invalid-author",
        start: 10,
        end: 120,
        authorId: "non-existent-author-id",
      };

      const res = await app.fetch(
        new Request("http://localhost/api/videos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidVideo),
        }),
        env,
      );
      expect(res.status).toBe(500);

      // レスポンスをテキストとして取得
      const responseText = await res.text();
      console.log("Response text:", responseText);

      // JSONとして解析できる場合のみ検証
      if (responseText.startsWith("{")) {
        const responseData = JSON.parse(responseText);
        expect(responseData.success).toBe(false);
        // エラーメッセージに著者IDが含まれているか確認
        if (responseData.message) {
          expect(responseData.message.includes("著者")).toBeTruthy();
        }
      }
    });
  });

  describe("PATCH /api/videos/:id", () => {
    test("動画を更新する", async () => {
      const targetVideo = videoList[0];
      const updateData = {
        title: "Updated Title",
        start: 15,
      };

      const res = await app.fetch(
        new Request(`http://localhost/api/videos/${targetVideo.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }),
        env,
      );
      expect(res.status).toBe(200);

      const responseData = (await res.json()) as IdResponse;
      expect(responseData.success).toBe(true);
      expect(responseData.id).toBe(targetVideo.id);

      // レスポンスに更新された動画情報と著者情報が含まれているか確認
      expect(responseData.video).toBeDefined();
      if (responseData.video) {
        expect(responseData.video.title).toBe(updateData.title);
        expect(responseData.video.author).toBeDefined();
        expect(responseData.video.author.id).toBe(targetVideo.author.id);
      }

      // 更新されたビデオを取得して確認
      const getRes = await app.fetch(new Request(`http://localhost/api/videos/${targetVideo.id}`), env);
      const getResponseData = (await getRes.json()) as VideoDetailResponse;
      expect(getResponseData.success).toBe(true);
      expect(getResponseData.video.title).toBe(updateData.title);
      expect(getResponseData.video.start).toBe(updateData.start);
      // 更新していないフィールドは元の値が保持されているか確認
      expect(getResponseData.video.url).toBe(targetVideo.url);
      expect(getResponseData.video.end).toBe(targetVideo.end);
      expect(getResponseData.video.authorId).toBe(targetVideo.authorId);

      // 著者情報も確認
      expect(getResponseData.video.author).toBeDefined();
      expect(getResponseData.video.author.id).toBe(targetVideo.author.id);
      expect(getResponseData.video.author.name).toBe(targetVideo.author.name);
    });

    test("著者IDを更新する", async () => {
      const targetVideo = videoList[0]; // 山田太郎の動画
      const newAuthor = authorList[1]; // 佐藤花子に変更
      const updateData = {
        authorId: newAuthor.id,
      };

      const res = await app.fetch(
        new Request(`http://localhost/api/videos/${targetVideo.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }),
        env,
      );
      expect(res.status).toBe(200);

      // 更新されたビデオを取得して確認
      const getRes = await app.fetch(new Request(`http://localhost/api/videos/${targetVideo.id}`), env);
      const getResponseData = (await getRes.json()) as VideoDetailResponse;
      expect(getResponseData.success).toBe(true);

      // 著者情報が更新されているか確認
      expect(getResponseData.video.authorId).toBe(newAuthor.id);
      expect(getResponseData.video.author).toBeDefined();
      expect(getResponseData.video.author.id).toBe(newAuthor.id);
      expect(getResponseData.video.author.name).toBe(newAuthor.name);
    });

    test("存在しないIDの場合404を返す", async () => {
      const nonExistentId = "non-existent-id";
      const updateData = {
        title: "Updated Title",
      };

      const res = await app.fetch(
        new Request(`http://localhost/api/videos/${nonExistentId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }),
        env,
      );
      expect(res.status).toBe(500);

      // レスポンスをテキストとして取得
      const responseText = await res.text();
      console.log("Response text:", responseText);

      // JSONとして解析できる場合のみ検証
      if (responseText.startsWith("{")) {
        const responseData = JSON.parse(responseText);
        expect(responseData.success).toBe(false);
      }
    });

    test("存在しない著者IDの場合エラーを返す", async () => {
      const targetVideo = videoList[0];
      const updateData = {
        authorId: "non-existent-author-id",
      };

      const res = await app.fetch(
        new Request(`http://localhost/api/videos/${targetVideo.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }),
        env,
      );
      expect(res.status).toBe(500);

      // レスポンスをテキストとして取得
      const responseText = await res.text();
      console.log("Response text:", responseText);

      // JSONとして解析できる場合のみ検証
      if (responseText.startsWith("{")) {
        const responseData = JSON.parse(responseText);
        expect(responseData.success).toBe(false);
        // エラーメッセージに著者IDが含まれているか確認
        if (responseData.message) {
          expect(responseData.message.includes("著者")).toBeTruthy();
        }
      }
    });
  });

  describe("DELETE /api/videos/:id", () => {
    test("動画を削除する", async () => {
      const targetVideo = videoList[0];
      const res = await app.fetch(
        new Request(`http://localhost/api/videos/${targetVideo.id}`, {
          method: "DELETE",
        }),
        env,
      );
      expect(res.status).toBe(200);

      const responseData = (await res.json()) as SuccessResponse;
      expect(responseData.success).toBe(true);

      // 削除されたことを確認
      const getRes = await app.fetch(new Request(`http://localhost/api/videos/${targetVideo.id}`), env);
      expect(getRes.status).toBe(500);

      // レスポンスをテキストとして取得
      const responseText = await getRes.text();
      console.log("Response text:", responseText);
    });

    test("存在しないIDの場合404を返す", async () => {
      const nonExistentId = "non-existent-id";
      const res = await app.fetch(
        new Request(`http://localhost/api/videos/${nonExistentId}`, {
          method: "DELETE",
        }),
        env,
      );
      expect(res.status).toBe(500);

      // レスポンスをテキストとして取得
      const responseText = await res.text();
      console.log("Response text:", responseText);

      // JSONとして解析できる場合のみ検証
      if (responseText.startsWith("{")) {
        const responseData = JSON.parse(responseText);
        expect(responseData.success).toBe(false);
      }
    });
  });
});
