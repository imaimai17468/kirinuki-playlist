import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { authors, follows, playlistVideos, playlists, tags, videoBookmarks, videoTags, videos } from "../src/db/models";

async function checkData() {
  try {
    const url = process.env.LIBSQL_URL || "http://localhost:8080";
    console.log(`[check] ${url}のデータを確認中...`);

    // データベースに接続
    const client = createClient({
      url,
    });
    const db = drizzle(client);

    // 著者データを取得
    console.log("\n=== 著者データ ===");
    const authorsData = await db.select().from(authors).all();
    console.log(`著者数: ${authorsData.length}`);
    for (const author of authorsData) {
      console.log(`- ${author.name} (ID: ${author.id})`);
    }

    // タグデータを取得
    console.log("\n=== タグデータ ===");
    const tagsData = await db.select().from(tags).all();
    console.log(`タグ数: ${tagsData.length}`);
    for (const tag of tagsData) {
      console.log(`- ${tag.name} (ID: ${tag.id})`);
    }

    // 動画データを取得
    console.log("\n=== 動画データ ===");
    const videosData = await db.select().from(videos).all();
    console.log(`動画数: ${videosData.length}`);
    for (const video of videosData) {
      console.log(`- ${video.title} (ID: ${video.id}, 作者ID: ${video.authorId})`);

      // 動画の作者名を表示
      const videoAuthor = authorsData.find((author) => author.id === video.authorId);
      if (videoAuthor) {
        console.log(`  作者: ${videoAuthor.name}`);
      }
    }

    // 動画-タグ関連を取得
    console.log("\n=== 動画-タグ関連 ===");
    const videoTagsData = await db.select().from(videoTags).all();
    console.log(`動画-タグ関連数: ${videoTagsData.length}`);

    // 各動画のタグを取得して表示
    for (const video of videosData) {
      const videoTagsList = await db
        .select()
        .from(videoTags)
        .innerJoin(tags, eq(videoTags.tagId, tags.id))
        .where(eq(videoTags.videoId, video.id))
        .all();

      if (videoTagsList.length > 0) {
        console.log(`- "${video.title}"のタグ: ${videoTagsList.map((vt) => vt.tags.name).join(", ")}`);
      } else {
        console.log(`- "${video.title}"にはタグがありません`);
      }
    }

    // 動画の人気タグ TOP5
    console.log("\n=== 人気タグ TOP5 ===");
    const tagUsageCounts = new Map<string, number>();
    for (const tag of tagsData) {
      const count = await db.select().from(videoTags).where(eq(videoTags.tagId, tag.id)).all();
      tagUsageCounts.set(tag.name, count.length);
    }

    const sortedTags = Array.from(tagUsageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    sortedTags.forEach(([tagName, count], index) => {
      console.log(`${index + 1}. ${tagName}: ${count}件の動画に使用`);
    });

    // プレイリストデータを取得
    console.log("\n=== プレイリストデータ ===");
    const playlistsData = await db.select().from(playlists).all();
    console.log(`プレイリスト数: ${playlistsData.length}`);
    for (const playlist of playlistsData) {
      // プレイリストの作者名を表示
      const playlistAuthor = authorsData.find((author) => author.id === playlist.authorId);
      console.log(`- ${playlist.title} (ID: ${playlist.id}, 作者: ${playlistAuthor?.name || "不明"})`);

      // プレイリスト内の動画を取得して表示
      const playlistItems = await db
        .select()
        .from(playlistVideos)
        .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
        .where(eq(playlistVideos.playlistId, playlist.id))
        .orderBy(playlistVideos.order)
        .all();

      if (playlistItems.length > 0) {
        console.log(`  含まれる動画 (${playlistItems.length}件):`);
        for (const item of playlistItems) {
          console.log(`    ${item.playlist_videos.order}. "${item.videos.title}" (ID: ${item.videos.id})`);
        }
      } else {
        console.log("  動画は含まれていません");
      }
    }

    // フォロー関係を取得
    console.log("\n=== フォロー関係 ===");
    const followsData = await db.select().from(follows).all();
    console.log(`フォロー関係数: ${followsData.length}`);

    // 各著者のフォロー情報を表示
    for (const author of authorsData) {
      // フォロー中（この著者がフォローしている人）
      const following = await db.select().from(follows).where(eq(follows.followerId, author.id)).all();

      // フォロワー（この著者をフォローしている人）
      const followers = await db.select().from(follows).where(eq(follows.followingId, author.id)).all();

      console.log(`- ${author.name}:`);

      if (following.length > 0) {
        console.log(`  フォロー中: ${following.length}人`);
        for (const follow of following) {
          const followingAuthor = authorsData.find((a) => a.id === follow.followingId);
          if (followingAuthor) {
            console.log(`    - ${followingAuthor.name}`);
          }
        }
      } else {
        console.log("  フォロー中: 0人");
      }

      if (followers.length > 0) {
        console.log(`  フォロワー: ${followers.length}人`);
        for (const follow of followers) {
          const followerAuthor = authorsData.find((a) => a.id === follow.followerId);
          if (followerAuthor) {
            console.log(`    - ${followerAuthor.name}`);
          }
        }
      } else {
        console.log("  フォロワー: 0人");
      }
    }

    // 動画ブックマークを取得
    console.log("\n=== 動画ブックマーク ===");
    const bookmarksData = await db.select().from(videoBookmarks).all();
    console.log(`ブックマーク数: ${bookmarksData.length}`);

    // 各著者のブックマークを取得して表示
    console.log("各著者のブックマーク:");
    for (const author of authorsData) {
      const authorBookmarks = await db
        .select()
        .from(videoBookmarks)
        .innerJoin(videos, eq(videoBookmarks.videoId, videos.id))
        .where(eq(videoBookmarks.authorId, author.id))
        .all();

      if (authorBookmarks.length > 0) {
        console.log(`- "${author.name}"のブックマーク: ${authorBookmarks.length}件`);
        for (const bookmark of authorBookmarks) {
          console.log(`  - "${bookmark.videos.title}" (ID: ${bookmark.video_bookmarks.id})`);
        }
      } else {
        console.log(`- "${author.name}"はブックマークしていません`);
      }
    }

    // 各動画がブックマークされた回数を表示
    console.log("\n各動画のブックマーク数:");
    for (const video of videosData) {
      const bookmarks = await db.select().from(videoBookmarks).where(eq(videoBookmarks.videoId, video.id)).all();

      if (bookmarks.length > 0) {
        console.log(`- "${video.title}": ${bookmarks.length}回ブックマークされています`);
      } else {
        console.log(`- "${video.title}": ブックマークされていません`);
      }
    }

    // 各著者のコンテンツ統計
    console.log("\n=== 著者別コンテンツ統計 ===");
    for (const author of authorsData) {
      // 動画数
      const authorVideos = await db.select().from(videos).where(eq(videos.authorId, author.id)).all();

      // プレイリスト数
      const authorPlaylists = await db.select().from(playlists).where(eq(playlists.authorId, author.id)).all();

      // 作成したブックマーク数
      const authorBookmarks = await db
        .select()
        .from(videoBookmarks)
        .where(eq(videoBookmarks.authorId, author.id))
        .all();

      // 自分の動画がブックマークされた数
      let bookmarksReceived = 0;
      for (const video of authorVideos) {
        const videoBookmarkCount = await db
          .select()
          .from(videoBookmarks)
          .where(eq(videoBookmarks.videoId, video.id))
          .all();
        bookmarksReceived += videoBookmarkCount.length;
      }

      console.log(`- ${author.name}の統計:`);
      console.log(`  作成した動画: ${authorVideos.length}件`);
      console.log(`  作成したプレイリスト: ${authorPlaylists.length}件`);
      console.log(`  ブックマークした動画: ${authorBookmarks.length}件`);
      console.log(`  自分の動画がブックマークされた数: ${bookmarksReceived}件`);
    }

    console.log("\n[check] データの確認が完了しました");
  } catch (error) {
    console.error("[check] データ確認中にエラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみcheckData()を呼び出す
if (require.main === module) {
  checkData().catch(console.error);
}

export { checkData };
