import { beforeEach, describe, expect, test } from "bun:test";
import { and, eq } from "drizzle-orm";
import { createTestDbClient } from "../../config/test-database";
import { authors } from "../../models/authors";
import { playlistBookmarks } from "../../models/playlist_bookmarks";
import { playlists } from "../../models/playlists";
import { NotFoundError } from "../../utils/errors";
import { createPlaylistBookmarkService } from "./playlist_bookmarks";

// Each test will use this test data
const testAuthors = [
  {
    id: "author1",
    name: "Test Author 1",
    iconUrl: "https://example.com/icon1.png",
    bio: "Test author 1 bio",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "author2",
    name: "Test Author 2",
    iconUrl: "https://example.com/icon2.png",
    bio: "Test author 2 bio",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const testPlaylists = [
  {
    id: "playlist1",
    title: "Test Playlist 1",
    authorId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "playlist2",
    title: "Test Playlist 2",
    authorId: "author2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "playlist3",
    title: "Test Playlist 3",
    authorId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const testBookmarks = [
  {
    id: "bookmark1",
    authorId: "author1",
    playlistId: "playlist2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "bookmark2",
    authorId: "author2",
    playlistId: "playlist1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Helper function: Initialize database and service
async function setupDatabase() {
  const dbClient = await createTestDbClient();
  const service = createPlaylistBookmarkService(dbClient);

  // Clear tables
  await dbClient.delete(playlistBookmarks).run();
  await dbClient.delete(playlists).run();
  await dbClient.delete(authors).run();

  // Insert test data
  for (const author of testAuthors) {
    await dbClient.insert(authors).values(author);
  }

  for (const playlist of testPlaylists) {
    await dbClient.insert(playlists).values(playlist);
  }

  for (const bookmark of testBookmarks) {
    await dbClient.insert(playlistBookmarks).values(bookmark);
  }

  return { dbClient, service };
}

describe("playlistBookmarkService", () => {
  describe("getBookmarksByAuthorId", () => {
    let service: ReturnType<typeof createPlaylistBookmarkService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("should retrieve bookmarks for an author", async () => {
      const result = await service.getBookmarksByAuthorId("author1");

      // author1 has bookmarked playlist2
      expect(result).toHaveLength(1);

      // We need to verify basic properties since we can't know full details
      // as the service loads data through the playlist service
      expect(result[0].id).toBe("playlist2");
      expect(result[0].title).toBe("Test Playlist 2");
      expect(result[0].authorId).toBe("author2");
    });

    test("should retrieve bookmarks for an author who has bookmarks", async () => {
      // author2 has bookmarked playlist1
      const result = await service.getBookmarksByAuthorId("author2");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("playlist1");
    });

    test("should return empty array for author with no bookmarks", async () => {
      // Add a new author with no bookmarks
      const dbClient = await createTestDbClient();
      await dbClient.insert(authors).values({
        id: "author3",
        name: "Author with no bookmarks",
        iconUrl: "https://example.com/icon3.png",
        bio: "Author with no bookmarks",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service = createPlaylistBookmarkService(dbClient);
      const result = await service.getBookmarksByAuthorId("author3");
      expect(result).toHaveLength(0);
    });

    test("should throw NotFoundError for non-existent author ID", async () => {
      let errorThrown = false;
      try {
        await service.getBookmarksByAuthorId("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("getAuthorsByBookmarkedPlaylistId", () => {
    let service: ReturnType<typeof createPlaylistBookmarkService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("should retrieve authors who bookmarked a playlist", async () => {
      const result = await service.getAuthorsByBookmarkedPlaylistId("playlist1");

      // playlist1 is bookmarked by author2
      expect(result).toHaveLength(1);
      expect(result[0]).toBe("author2");
    });

    test("should return empty array for playlist with no bookmarks", async () => {
      const result = await service.getAuthorsByBookmarkedPlaylistId("playlist3");
      expect(result).toHaveLength(0);
    });

    test("should throw NotFoundError for non-existent playlist ID", async () => {
      let errorThrown = false;
      try {
        await service.getAuthorsByBookmarkedPlaylistId("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("createBookmark", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createPlaylistBookmarkService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("should create a new bookmark", async () => {
      // Create a bookmark with a new combination
      const result = await service.createBookmark("author1", "playlist3");

      // Check the result
      expect(result.authorId).toBe("author1");
      expect(result.playlistId).toBe("playlist3");
      expect(result.id).toBeDefined();

      // Verify it was saved to the database
      const savedBookmark = await dbClient
        .select()
        .from(playlistBookmarks)
        .where(and(eq(playlistBookmarks.authorId, "author1"), eq(playlistBookmarks.playlistId, "playlist3")))
        .get();

      expect(savedBookmark).toBeDefined();
      expect(savedBookmark?.authorId).toBe("author1");
      expect(savedBookmark?.playlistId).toBe("playlist3");
    });

    test("should return existing bookmark when trying to create a duplicate", async () => {
      // Try to create a bookmark that already exists
      const result = await service.createBookmark("author1", "playlist2");

      // Check the result (should return existing bookmark)
      expect(result.authorId).toBe("author1");
      expect(result.playlistId).toBe("playlist2");
      expect(result.id).toBe("bookmark1");

      // Verify no duplicate records were created
      const bookmarks = await dbClient
        .select()
        .from(playlistBookmarks)
        .where(and(eq(playlistBookmarks.authorId, "author1"), eq(playlistBookmarks.playlistId, "playlist2")))
        .all();

      expect(bookmarks).toHaveLength(1);
    });

    test("should throw NotFoundError for non-existent author ID", async () => {
      let errorThrown = false;
      try {
        await service.createBookmark("non-existent", "playlist1");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
        expect((error as NotFoundError).message).toContain("著者が見つかりません");
      }
      expect(errorThrown).toBe(true);
    });

    test("should throw NotFoundError for non-existent playlist ID", async () => {
      let errorThrown = false;
      try {
        await service.createBookmark("author1", "non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
        expect((error as NotFoundError).message).toContain("プレイリストが見つかりません");
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("deleteBookmark", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createPlaylistBookmarkService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("should delete a bookmark", async () => {
      // Check state before deletion
      const beforeDelete = await dbClient
        .select()
        .from(playlistBookmarks)
        .where(and(eq(playlistBookmarks.authorId, "author1"), eq(playlistBookmarks.playlistId, "playlist2")))
        .get();
      expect(beforeDelete).toBeDefined();

      // Delete the bookmark
      await service.deleteBookmark("author1", "playlist2");

      // Check state after deletion
      const afterDelete = await dbClient
        .select()
        .from(playlistBookmarks)
        .where(and(eq(playlistBookmarks.authorId, "author1"), eq(playlistBookmarks.playlistId, "playlist2")))
        .get();
      expect(afterDelete).toBeUndefined();
    });

    test("should throw NotFoundError when trying to delete non-existent bookmark", async () => {
      let errorThrown = false;
      try {
        // Non-existent combination
        await service.deleteBookmark("author1", "playlist1");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
        expect((error as NotFoundError).message).toContain("ブックマークが見つかりません");
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("hasBookmarked", () => {
    let service: ReturnType<typeof createPlaylistBookmarkService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("should return true when bookmark exists", async () => {
      const result = await service.hasBookmarked("author1", "playlist2");
      expect(result).toBe(true);
    });

    test("should return false when bookmark doesn't exist", async () => {
      const result = await service.hasBookmarked("author1", "playlist1");
      expect(result).toBe(false);
    });

    test("should return false for non-existent author/playlist combination without throwing error", async () => {
      const result = await service.hasBookmarked("author1", "non-existent");
      expect(result).toBe(false);
    });
  });
});
