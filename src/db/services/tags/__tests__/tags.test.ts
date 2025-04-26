import { beforeEach, describe, expect, test } from "bun:test";
import { createTestDbClient } from "@/db/config/test-database";
import { authors } from "@/db/models/authors";
import { videoTags } from "@/db/models/relations";
import { tags } from "@/db/models/tags";
import { videos } from "@/db/models/videos";
import { createTagService } from "@/db/services/tags";
import { NotFoundError, UniqueConstraintError } from "@/db/utils/errors";
import { eq } from "drizzle-orm";

// 各テストで使用するテストデータ
const testAuthors = [
  {
    id: "author1",
    name: "テスト著者1",
    iconUrl: "https://example.com/icon1.png",
    bio: "テスト著者1の自己紹介",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "author2",
    name: "テスト著者2",
    iconUrl: "https://example.com/icon2.png",
    bio: "テスト著者2の自己紹介",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const testTags = [
  {
    id: "tag1",
    name: "タグ1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tag2",
    name: "タグ2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tag3",
    name: "タグ3",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const testVideos = [
  {
    id: "video1",
    title: "テスト動画1",
    url: "https://example.com/video1",
    start: 0,
    end: 60,
    authorId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "video2",
    title: "テスト動画2",
    url: "https://example.com/video2",
    start: 10,
    end: 120,
    authorId: "author2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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
    tagId: "tag2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    videoId: "video2",
    tagId: "tag3",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 新規タグデータ
const newTag = {
  name: "新規タグ",
};

// ヘルパー関数: データベースとサービスの初期化
async function setupDatabase() {
  const dbClient = await createTestDbClient();
  const service = createTagService(dbClient);

  // テーブルをクリア
  await dbClient.delete(videoTags).run();
  await dbClient.delete(videos).run();
  await dbClient.delete(tags).run();
  await dbClient.delete(authors).run();

  // テストデータを挿入
  for (const author of testAuthors) {
    await dbClient.insert(authors).values(author);
  }

  for (const tag of testTags) {
    await dbClient.insert(tags).values(tag);
  }

  for (const video of testVideos) {
    await dbClient.insert(videos).values(video);
  }

  for (const videoTag of testVideoTags) {
    await dbClient.insert(videoTags).values(videoTag);
  }

  return { dbClient, service };
}

describe("tagService", () => {
  describe("getAllTags", () => {
    let service: ReturnType<typeof createTagService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("全てのタグを関連動画付きで取得できること", async () => {
      const result = await service.getAllTags();

      // 件数を確認
      expect(result.length).toBe(3);

      // データの中身を確認（IDでソートして順序を保証）
      const sorted = result.sort((a, b) => a.id.localeCompare(b.id));

      expect(sorted[0].id).toBe("tag1");
      expect(sorted[0].name).toBe("タグ1");
      expect(sorted[0].videos.length).toBe(1); // tag1は1つの動画に関連
      expect(sorted[0].videos[0].id).toBe("video1");

      expect(sorted[1].id).toBe("tag2");
      expect(sorted[1].name).toBe("タグ2");
      expect(sorted[1].videos.length).toBe(2); // tag2は2つの動画に関連
      expect(sorted[1].videos.map((v) => v.id).sort()).toEqual(["video1", "video2"]);

      expect(sorted[2].id).toBe("tag3");
      expect(sorted[2].name).toBe("タグ3");
      expect(sorted[2].videos.length).toBe(1); // tag3は1つの動画に関連
      expect(sorted[2].videos[0].id).toBe("video2");
    });
  });

  describe("getTagById", () => {
    let service: ReturnType<typeof createTagService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("IDを指定してタグと関連動画を取得できること", async () => {
      const result = await service.getTagById("tag2");

      expect(result.id).toBe("tag2");
      expect(result.name).toBe("タグ2");
      expect(result.videos.length).toBe(2);

      // 関連動画のチェック
      const sortedVideos = result.videos.sort((a, b) => a.id.localeCompare(b.id));
      expect(sortedVideos[0].id).toBe("video1");
      expect(sortedVideos[0].title).toBe("テスト動画1");
      expect(sortedVideos[0].author.name).toBe("テスト著者1");

      expect(sortedVideos[1].id).toBe("video2");
      expect(sortedVideos[1].title).toBe("テスト動画2");
      expect(sortedVideos[1].author.name).toBe("テスト著者2");
    });

    test("存在しないIDの場合はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.getTagById("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("createTag", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createTagService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("新しいタグを作成できること", async () => {
      // タグを作成
      const id = await service.createTag(newTag);

      // IDが返されることを確認
      expect(id).toBeDefined();

      // 作成されたタグを確認
      const createdTag = await dbClient.select().from(tags).where(eq(tags.id, id)).get();

      expect(createdTag).toBeDefined();
      expect(createdTag?.name).toBe("新規タグ");
    });

    test("同じ名前のタグを作成するとUniqueConstraintErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.createTag({ name: "タグ1" }); // 既存のタグ名
      } catch (error) {
        errorThrown = true;
        expect(error instanceof UniqueConstraintError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("updateTag", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createTagService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("タグを更新できること", async () => {
      const updateData = {
        name: "更新タグ名",
      };

      // タグを更新
      await service.updateTag("tag1", updateData);

      // 更新されたタグを確認
      const updatedTag = await dbClient.select().from(tags).where(eq(tags.id, "tag1")).get();

      expect(updatedTag).toBeDefined();
      expect(updatedTag?.name).toBe("更新タグ名");
    });

    test("存在しないIDの更新はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.updateTag("non-existent", { name: "更新名" });
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });

    test("既存タグと同じ名前に更新するとUniqueConstraintErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.updateTag("tag1", { name: "タグ2" }); // 既存のタグ名
      } catch (error) {
        errorThrown = true;
        expect(error instanceof UniqueConstraintError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("deleteTag", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createTagService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("タグとその関連付けを削除できること", async () => {
      // 削除前に存在確認
      const beforeDeleteTag = await dbClient.select().from(tags).where(eq(tags.id, "tag1")).get();
      expect(beforeDeleteTag).toBeDefined();

      const beforeDeleteVideoTags = await dbClient.select().from(videoTags).where(eq(videoTags.tagId, "tag1")).all();
      expect(beforeDeleteVideoTags.length).toBe(1);

      // タグを削除
      await service.deleteTag("tag1");

      // 削除後にタグが存在しないことを確認
      const afterDeleteTag = await dbClient.select().from(tags).where(eq(tags.id, "tag1")).get();
      expect(afterDeleteTag).toBeUndefined();

      // 削除後に関連付けも存在しないことを確認
      const afterDeleteVideoTags = await dbClient.select().from(videoTags).where(eq(videoTags.tagId, "tag1")).all();
      expect(afterDeleteVideoTags.length).toBe(0);
    });

    test("存在しないIDの削除はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.deleteTag("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("getVideosByTagIds", () => {
    let service: ReturnType<typeof createTagService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("指定したタグの動画IDを取得できること", async () => {
      const result = await service.getVideosByTagIds(["tag1"]);

      expect(result.length).toBe(1);
      expect(result[0]).toBe("video1");
    });

    test("複数のタグで動画IDを取得できること（OR検索）", async () => {
      const result = await service.getVideosByTagIds(["tag1", "tag3"]);

      expect(result.length).toBe(2);
      expect(result.sort()).toEqual(["video1", "video2"]);
    });

    test("タグIDが空の場合は空配列を返すこと", async () => {
      const result = await service.getVideosByTagIds([]);

      expect(result.length).toBe(0);
    });
  });

  describe("getVideosByAllTags", () => {
    let service: ReturnType<typeof createTagService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("複数のタグをすべて持つ動画IDを取得できること（AND検索）", async () => {
      const result = await service.getVideosByAllTags(["tag1", "tag2"]);

      expect(result.length).toBe(1);
      expect(result[0]).toBe("video1"); // video1だけがtag1とtag2の両方を持つ
    });

    test("共通する動画がない場合は空配列を返すこと", async () => {
      const result = await service.getVideosByAllTags(["tag1", "tag3"]);

      expect(result.length).toBe(0); // tag1とtag3を両方持つ動画はない
    });

    test("タグIDが空の場合は空配列を返すこと", async () => {
      const result = await service.getVideosByAllTags([]);

      expect(result.length).toBe(0);
    });
  });
});
