import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { DbClient } from "@/db/config/hono";
import {
  cleanupTestData,
  insertTestAuthors,
  insertTestPlaylistVideos,
  insertTestPlaylists,
  insertTestVideos,
  setupTestEnv,
} from "@/repositories/test/setup";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllPlaylists,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
  updatePlaylistVideo,
} from "../playlists";
import type { PlaylistInsert, PlaylistUpdate, PlaylistVideoInsert, PlaylistVideoUpdate } from "../playlists/types";

// テスト用の状態を保持する変数
let dbClient: DbClient;

describe("プレイリストリポジトリのテスト", () => {
  // 各テストの前に実行するセットアップ
  beforeEach(async () => {
    // テスト環境をセットアップ
    const env = await setupTestEnv();
    dbClient = env.dbClient;

    // テストデータを挿入
    await insertTestAuthors(dbClient);
    await insertTestVideos(dbClient);
    await insertTestPlaylists(dbClient);
    await insertTestPlaylistVideos(dbClient);
  });

  // 各テストの後に実行するクリーンアップ
  afterEach(async () => {
    await cleanupTestData(dbClient);
  });

  describe("getAllPlaylists", () => {
    it("プレイリスト一覧を正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getAllPlaylists();

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const playlists = result.value;

        // 正しい数のプレイリストが取得できていることを確認
        expect(playlists.length).toBe(2);

        // 特定のプロパティが正しく含まれていることを確認
        expect(playlists[0].id).toBe("playlist1");
        expect(playlists[0].title).toBe("テストプレイリスト1");
        expect(playlists[0].authorId).toBe("author1");

        expect(playlists[1].id).toBe("playlist2");
        expect(playlists[1].title).toBe("テストプレイリスト2");
        expect(playlists[1].authorId).toBe("author2");
      }
    });
  });

  describe("getPlaylistById", () => {
    it("存在するプレイリストIDで正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getPlaylistById("playlist1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const playlist = result.value;

        // 取得したプレイリストの情報が正しいことを確認
        expect(playlist.id).toBe("playlist1");
        expect(playlist.title).toBe("テストプレイリスト1");
        expect(playlist.authorId).toBe("author1");
      }
    });

    it("存在しないプレイリストIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await getPlaylistById("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("notFound");
      }
    });

    it("プレイリストに関連する動画と動画の作者情報が正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getPlaylistById("playlist1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const playlist = result.value;

        // プレイリスト情報を確認
        expect(playlist.id).toBe("playlist1");
        expect(playlist.title).toBe("テストプレイリスト1");

        // 動画情報があることを確認
        expect(playlist.videos).toBeDefined();
        expect(Array.isArray(playlist.videos)).toBe(true);
        expect(playlist.videos?.length).toBeGreaterThan(0);

        if (playlist.videos) {
          // 関連する動画の情報を確認
          const video1 = playlist.videos.find((v) => v.id === "video1");
          expect(video1).toBeDefined();

          if (video1) {
            expect(video1.title).toBe("テストビデオ1");
            expect(video1.url).toBe("https://example.com/video1");

            // 動画の作者情報を確認
            expect(video1.author).toBeDefined();
            if (video1.author) {
              expect(video1.author.id).toBe("author1");
              expect(video1.author.name).toBe("テスト著者1");
              expect(video1.author.iconUrl).toBe("https://example.com/icon1.jpg");
            }
          }

          // 複数の動画がある場合は2つ目の動画も確認
          const video2 = playlist.videos.find((v) => v.id === "video2");
          expect(video2).toBeDefined();

          if (video2) {
            expect(video2.title).toBe("テストビデオ2");
            expect(video2.author).toBeDefined();
            if (video2.author) {
              expect(video2.author.id).toBe("author2");
              expect(video2.author.name).toBe("テスト著者2");
            }
          }
        }
      }
    });

    it("プレイリスト内の動画がorder情報を持ち、正しくソートされていること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getPlaylistById("playlist1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const playlist = result.value;

        // 動画情報があることを確認
        expect(playlist.videos).toBeDefined();
        expect(Array.isArray(playlist.videos)).toBe(true);

        if (playlist.videos) {
          expect(playlist.videos.length).toBeGreaterThan(0);

          // すべての動画がorder情報を持っていることを確認
          for (const video of playlist.videos) {
            expect(video.order).toBeDefined();
            expect(typeof video.order).toBe("number");
          }

          // 動画がorder順に並んでいることを確認（昇順）
          if (playlist.videos.length >= 2) {
            const sortedVideos = [...playlist.videos].sort((a, b) => a.order - b.order);

            // 並び順が同じであることを確認（IDで比較）
            for (let i = 0; i < playlist.videos.length; i++) {
              expect(playlist.videos[i].id).toBe(sortedVideos[i].id);
            }
          }
        }
      }
    });
  });

  describe("createPlaylist", () => {
    it("プレイリストを正しく作成できること", async () => {
      // テスト用のプレイリストデータ
      const playlistData: PlaylistInsert = {
        title: "新しいプレイリスト",
        authorId: "author1",
      };

      // リポジトリ関数を呼び出し
      const result = await createPlaylist(playlistData);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        // IDが返されていることを確認
        expect(typeof result.value).toBe("string");
        expect(result.value.length).toBeGreaterThan(0);

        // 作成したプレイリストが実際に取得できることを確認
        const getResult = await getPlaylistById(result.value);
        expect(getResult.isOk()).toBe(true);

        if (getResult.isOk()) {
          const playlist = getResult.value;
          expect(playlist.title).toBe(playlistData.title);
          expect(playlist.authorId).toBe(playlistData.authorId);
        }
      }
    });

    it("バリデーションエラーが発生した場合はエラーになること", async () => {
      // 不正なデータでリポジトリ関数を呼び出し
      const result = await createPlaylist({
        title: "",
        authorId: "",
      } as PlaylistInsert);

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("badRequest");
      }
    });
  });

  describe("updatePlaylist", () => {
    it("プレイリストを正しく更新できること", async () => {
      // テスト用の更新データ
      const updateData: PlaylistUpdate = {
        title: "更新されたプレイリストタイトル",
      };

      // リポジトリ関数を呼び出し
      const result = await updatePlaylist("playlist1", updateData);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      // 更新後のプレイリストを取得して確認
      const getResult = await getPlaylistById("playlist1");
      expect(getResult.isOk()).toBe(true);

      if (getResult.isOk()) {
        const playlist = getResult.value;
        expect(playlist.title).toBe("更新されたプレイリストタイトル");
      }
    });

    it("存在しないプレイリストIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await updatePlaylist("non-existent-id", {
        title: "更新テスト",
      });

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("notFound");
      }
    });
  });

  describe("deletePlaylist", () => {
    it("プレイリストを正しく削除できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await deletePlaylist("playlist1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      // 削除後にプレイリストが存在しないことを確認
      const getResult = await getPlaylistById("playlist1");
      expect(getResult.isErr()).toBe(true);

      if (getResult.isErr()) {
        const error = getResult.error;
        expect(error.type).toBe("notFound");
      }
    });

    it("存在しないプレイリストIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await deletePlaylist("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("notFound");
      }
    });
  });

  describe("addVideoToPlaylist", () => {
    it("プレイリストに動画を正しく追加できること", async () => {
      // テスト用の動画追加データ
      const videoData: PlaylistVideoInsert = {
        videoId: "video2", // playlist1にはvideo1が既に存在するので別の動画を追加
        order: 2,
      };

      // リポジトリ関数を呼び出し
      const result = await addVideoToPlaylist("playlist1", videoData);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      // 追加後のプレイリストを取得して動画が追加されていることを確認
      const getResult = await getPlaylistById("playlist1");
      expect(getResult.isOk()).toBe(true);

      if (getResult.isOk()) {
        const playlist = getResult.value;
        expect(playlist.videos).toBeDefined();

        if (playlist.videos) {
          // 追加した動画が存在することを確認
          const addedVideo = playlist.videos.find((v) => v.id === videoData.videoId);
          expect(addedVideo).toBeDefined();

          if (addedVideo) {
            expect(addedVideo.order).toBe(videoData.order);
          }
        }
      }
    });

    it("存在しないプレイリストIDではエラーになること", async () => {
      // 存在しないプレイリストIDで動画追加を試みる
      const result = await addVideoToPlaylist("non-existent-id", {
        videoId: "video1",
        order: 1,
      });

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("notFound");
      }
    });

    it("存在しない動画IDではエラーになること", async () => {
      // 存在しない動画IDでプレイリストへの追加を試みる
      const result = await addVideoToPlaylist("playlist1", {
        videoId: "non-existent-video",
        order: 1,
      });

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;
        // エラータイプが badRequest または notFound のどちらかであることを確認
        expect(["badRequest", "notFound"]).toContain(error.type);
      }
    });
  });

  describe("removeVideoFromPlaylist", () => {
    it("プレイリストから動画を正しく削除できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await removeVideoFromPlaylist("playlist1", "video1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      // 削除後のプレイリストを取得して動画が削除されていることを確認
      const getResult = await getPlaylistById("playlist1");
      expect(getResult.isOk()).toBe(true);

      if (getResult.isOk()) {
        const playlist = getResult.value;
        expect(playlist.videos).toBeDefined();

        if (playlist.videos) {
          // 削除した動画が存在しないことを確認
          const removedVideo = playlist.videos.find((v) => v.id === "video1");
          expect(removedVideo).toBeUndefined();
        }
      }
    });

    it("存在しないプレイリストまたは動画IDではエラーになること", async () => {
      // 存在しないプレイリストIDで動画削除を試みる
      const result = await removeVideoFromPlaylist("non-existent-id", "video1");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("notFound");
      }

      // 存在しない動画IDでプレイリストからの削除を試みる
      const result2 = await removeVideoFromPlaylist("playlist1", "non-existent-video");

      // 結果がエラーであることを確認
      expect(result2.isErr()).toBe(true);

      if (result2.isErr()) {
        const error = result2.error;
        // エラータイプが notFound または badRequest のどちらかであることを確認
        expect(["notFound", "badRequest"]).toContain(error.type);
      }
    });
  });

  describe("updatePlaylistVideo", () => {
    it("プレイリスト内の動画の順序を正しく更新できること", async () => {
      // テスト用の更新データ
      const updateData: PlaylistVideoUpdate = {
        order: 999,
      };

      // リポジトリ関数を呼び出し
      const result = await updatePlaylistVideo("playlist1", "video1", updateData);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      // 更新後のプレイリストを取得して、動画の順序が更新されていることを確認
      const getResult = await getPlaylistById("playlist1");
      expect(getResult.isOk()).toBe(true);

      if (getResult.isOk()) {
        const playlist = getResult.value;
        expect(playlist.videos).toBeDefined();

        if (playlist.videos) {
          // 更新した動画を見つける
          const updatedVideo = playlist.videos.find((v) => v.id === "video1");
          expect(updatedVideo).toBeDefined();

          if (updatedVideo) {
            // 順序が更新されていることを確認
            expect(updatedVideo.order).toBe(updateData.order);
          }
        }
      }
    });

    it("存在しないプレイリストIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await updatePlaylistVideo("non-existent-id", "video1", {
        order: 1,
      });

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;
        // 適切なエラータイプであることを確認
        expect(error.type).toBe("notFound");
      }
    });

    it("存在しない動画IDではエラーになること", async () => {
      // 存在しない動画IDでリポジトリ関数を呼び出し
      const result = await updatePlaylistVideo("playlist1", "non-existent-video", {
        order: 1,
      });

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;
        // エラータイプが notFound または badRequest のいずれかであることを確認
        expect(["notFound", "badRequest"]).toContain(error.type);
      }
    });
  });
});
