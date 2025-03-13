// nanoidのCommonJS版をインポート
import { nanoid } from "nanoid/non-secure";
import type { Video } from "../../models";

// テスト用のビデオデータ
export const videoList: Video[] = [
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

// 新しいビデオデータを作成するヘルパー関数
export const createVideoData = (overrides: Partial<Video> = {}): Video => {
  return {
    id: nanoid(),
    title: "Test Video",
    url: "https://www.youtube.com/watch?v=test12345",
    start: 0,
    end: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};
