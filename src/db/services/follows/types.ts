// ユーザー情報の型（UserCardコンポーネントと互換性を持つ）
export interface User {
  id: string;
  name: string;
  iconUrl: string;
  createdAt?: Date;
  bio?: string | null;
  followerCount?: number;
  videoCount?: number;
  playlistCount?: number;
}
