// 基本的なVideo操作
export {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} from "@/repositories/videos/base";

// タグ関連の操作
export {
  addTagToVideo,
  removeTagFromVideo,
  getVideoTags,
} from "@/repositories/videos/features/tags";

// 型定義をre-export
export type {
  Tag,
  Video,
  VideosResponse,
  VideoResponse,
  VideoInsert,
  VideoUpdate,
  VideoCreateResponse,
  VideoUpdateDeleteResponse,
  VideoTagsResponse,
} from "./types";
