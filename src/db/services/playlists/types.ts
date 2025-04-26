import type { InferInsertModel } from "drizzle-orm";
import type { Playlist } from "../../models/playlists";
import type { playlists } from "../../models/playlists";

// 著者情報を含むプレイリストの型
export type PlaylistWithAuthor = Playlist & {
  author: {
    id: string;
    name: string;
    iconUrl: string;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export type PlaylistWithAuthorAndVideos = PlaylistWithAuthor & {
  videos: {
    id: string;
    title: string;
    url: string;
    start: number | null;
    end: number | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string;
      iconUrl: string;
      bio: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    tags: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }[];
};

export type PlaylistInsert = Omit<InferInsertModel<typeof playlists>, "id" | "createdAt" | "updatedAt">;

export type PlaylistUpdate = Partial<Omit<InferInsertModel<typeof playlists>, "id" | "createdAt" | "updatedAt">>;

export type PlaylistVideoInsert = {
  videoId: string;
  order: number;
};

export type PlaylistVideoUpdate = {
  order: number;
};
