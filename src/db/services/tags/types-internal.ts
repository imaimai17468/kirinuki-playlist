import type { TagBase, TagInsert, TagUpdate, TagWithVideos } from "./types";

// 基本タグサービスの型
export interface BaseTagService {
  _getTagsWithoutVideos(): Promise<TagBase[]>;
  _getTagByIdWithoutVideos(id: string): Promise<TagBase>;
  getAllTags(): Promise<TagWithVideos[]>;
  getTagById(id: string): Promise<TagWithVideos>;
  createTag(data: TagInsert): Promise<string>;
  updateTag(id: string, data: TagUpdate): Promise<void>;
  deleteTag(id: string): Promise<void>;
}

// タグと動画の関連操作サービスの型
export interface RelationsTagService {
  getTagById(id: string): Promise<TagWithVideos>;
  getAllTags(): Promise<TagWithVideos[]>;
}

// タグ検索サービスの型
export interface SearchTagService {
  getVideosByTagIds(tagIds: string[]): Promise<string[]>;
  getVideosByAllTags(tagIds: string[]): Promise<string[]>;
}
