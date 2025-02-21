import { google } from "googleapis";

const youtube = google.youtube("v3");

interface MovieDetail {
  title: string;
  channelTitle: string;
}

export const getMovieDetail = async (apiKey: string, videoId: string): Promise<MovieDetail> => {
  try {
    const response = await youtube.videos.list({
      key: apiKey,
      id: [videoId],
      part: ["snippet"],
    });

    const video = response.data.items?.[0];

    if (!video || !video.snippet) {
      throw new Error("動画が見つかりませんでした");
    }

    return {
      title: video.snippet.title || "",
      channelTitle: video.snippet.channelTitle || "",
    };
  } catch (error) {
    console.error("動画情報の取得に失敗しました:", error);
    throw error;
  }
};
