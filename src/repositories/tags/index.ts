// 基本的なタグ操作
export {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} from "@/repositories/tags/base";

// タグに関連する動画操作
export {
  getVideosByTagIds,
  getVideosByAllTags,
} from "@/repositories/tags/features/videos";

// 型定義をre-export
export type {
  Tag,
  TagWithVideos,
  TagsResponse,
  TagResponse,
  TagInsert,
  TagUpdate,
  TagCreateResponse,
  TagUpdateDeleteResponse,
  TagVideosResponse,
} from "./types";
