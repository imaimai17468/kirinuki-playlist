// nanoidのCommonJS版をインポート
import { nanoid } from "nanoid/non-secure";
import type { Author } from "../../models/authors";
import type { Video as VideoModel } from "../../models/videos";

// テスト用のVideo型を定義（著者情報を含む）
export type Video = VideoModel & {
  author: {
    id: string;
    name: string;
    iconUrl: string;
    bio: string | null;
  };
};

// テスト用の著者データ
export const authorList: Author[] = [
  {
    id: nanoid(),
    name: "山田太郎",
    iconUrl: "https://example.com/icons/yamada.png",
    bio: "音楽プロデューサー。様々なアーティストと仕事をしています。",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: nanoid(),
    name: "佐藤花子",
    iconUrl: "https://example.com/icons/sato.png",
    bio: "DJ兼プレイリストキュレーター。",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: nanoid(),
    name: "鈴木一郎",
    iconUrl: "https://example.com/icons/suzuki.png",
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 新しい著者データを作成するヘルパー関数
export const createAuthorData = (overrides: Partial<Author> = {}): Author => {
  return {
    id: nanoid(),
    name: "テスト著者",
    iconUrl: "https://example.com/icons/test.png",
    bio: "テスト用の著者プロフィール",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

// テスト用のビデオデータ
export const videoList: Video[] = [
  {
    id: nanoid(),
    title: "Learning Hono",
    url: "https://www.youtube.com/watch?v=1234567890",
    start: 0,
    end: 100,
    authorId: authorList[0].id, // 山田太郎の動画
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: authorList[0].id,
      name: authorList[0].name,
      iconUrl: authorList[0].iconUrl,
      bio: authorList[0].bio,
    },
  },
  {
    id: nanoid(),
    title: "Watch the movie",
    url: "https://www.youtube.com/watch?v=1234567890",
    start: 0,
    end: 100,
    authorId: authorList[1].id, // 佐藤花子の動画
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: authorList[1].id,
      name: authorList[1].name,
      iconUrl: authorList[1].iconUrl,
      bio: authorList[1].bio,
    },
  },
  {
    id: nanoid(),
    title: "Buy milk",
    url: "https://www.youtube.com/watch?v=1234567890",
    start: 0,
    end: 100,
    authorId: authorList[2].id, // 鈴木一郎の動画
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: authorList[2].id,
      name: authorList[2].name,
      iconUrl: authorList[2].iconUrl,
      bio: authorList[2].bio,
    },
  },
];

// 新しいビデオデータを作成するヘルパー関数
export const createVideoData = (overrides: Partial<Video> = {}): Video => {
  const authorId = overrides.authorId || authorList[0].id;
  const author = authorList.find((a) => a.id === authorId) || authorList[0];

  return {
    id: nanoid(),
    title: "Test Video",
    url: "https://www.youtube.com/watch?v=test12345",
    start: 0,
    end: 60,
    authorId: author.id, // デフォルトでは山田太郎の動画
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: author.id,
      name: author.name,
      iconUrl: author.iconUrl,
      bio: author.bio,
    },
    ...overrides,
  };
};
