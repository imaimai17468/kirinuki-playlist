import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { authors, playlistVideos, playlists, tags, videoTags, videos } from "../src/db/models";

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
      console.log(`- ${video.title} (ID: ${video.id})`);
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

    // プレイリストデータを取得
    console.log("\n=== プレイリストデータ ===");
    const playlistsData = await db.select().from(playlists).all();
    console.log(`プレイリスト数: ${playlistsData.length}`);
    for (const playlist of playlistsData) {
      console.log(`- ${playlist.title} (ID: ${playlist.id})`);
    }

    // プレイリスト-動画関連を取得
    console.log("\n=== プレイリスト-動画関連 ===");
    const playlistVideosData = await db.select().from(playlistVideos).all();
    console.log(`プレイリスト-動画関連数: ${playlistVideosData.length}`);

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
