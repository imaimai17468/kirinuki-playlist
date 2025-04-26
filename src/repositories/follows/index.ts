// 基本的なフォロー操作
export {
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  isFollowing,
} from "@/repositories/follows/base";

// フック関連をエクスポート
export {
  useFollowStatus,
  useFollowMutations,
} from "@/repositories/follows/hooks";

// 型定義をre-export
export type {
  FollowersResponse,
  FollowingResponse,
  IsFollowingResponse,
  UserWithCountsType,
} from "./types";
