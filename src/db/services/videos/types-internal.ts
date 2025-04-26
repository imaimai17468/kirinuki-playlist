import type { VideoBase, VideoInsert, VideoUpdate, VideoWithTagsAndAuthor } from "./types";

// 基本ビデオサービスの型定義（内部利用）
export interface BaseVideoService {
  _getVideosWithoutAuthors(): Promise<VideoBase[]>;
  _getVideoByIdWithoutAuthor(id: string): Promise<VideoBase>;
  getAllVideos(): Promise<VideoWithTagsAndAuthor[]>;
  getVideoById(id: string): Promise<VideoWithTagsAndAuthor>;
  createVideo(data: VideoInsert): Promise<string>;
  updateVideo(id: string, data: VideoUpdate): Promise<void>;
  deleteVideo(id: string): Promise<void>;
}

// タグサービスの型定義（内部利用）
export interface VideoTagsService extends BaseVideoService {
  getVideosByTags(tagIds: string[]): Promise<VideoWithTagsAndAuthor[]>;
  createVideoWithTags(data: VideoInsert & { tags: string[] }): Promise<string>;
  updateVideoTags(id: string, tagIds: string[]): Promise<void>;
  removeTagFromVideo(videoId: string, tagId: string): Promise<void>;
}
