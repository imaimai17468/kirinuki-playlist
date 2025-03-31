import { getApiClient } from "@/db/config/client";
import { type Result, err, ok } from "neverthrow";
import type { ApiError } from "../types";
import {
  type Tag,
  type TagInsert,
  type TagUpdate,
  type TagWithVideos,
  tagCreateResponseSchema,
  tagResponseSchema,
  tagUpdateDeleteResponseSchema,
  tagVideosResponseSchema,
  tagsResponseSchema,
} from "./types";

// ネットワークエラーを作成するヘルパー関数
const createNetworkError = (message: string): ApiError => ({
  type: "network",
  message,
});

// スキーマ検証エラーを作成するヘルパー関数
const createSchemaError = (message: string): ApiError => ({
  type: "serverError",
  message: `APIレスポンスのスキーマ検証に失敗しました: ${message}`,
});

// HTTPエラーを適切なApiError型に変換するヘルパー関数
const handleHttpError = (status: number, message: string): ApiError => {
  switch (status) {
    case 404:
      return { type: "notFound", message };
    case 400:
      return { type: "badRequest", message };
    default:
      return { type: "serverError", message };
  }
};

// タグリポジトリの実装
export const tagRepository = {
  // 全てのタグを取得
  async getAllTags(): Promise<Result<Tag[], ApiError>> {
    try {
      const client = getApiClient();
      const response = await client.api.tags.$get();

      if (!response.ok) {
        return err(handleHttpError(response.status, "タグ一覧の取得に失敗しました"));
      }

      const json = await response.json();
      const parseResult = tagsResponseSchema.safeParse(json);

      if (!parseResult.success) {
        return err(createSchemaError(parseResult.error.message));
      }

      return ok(parseResult.data.tags);
    } catch (error) {
      return err(
        createNetworkError(
          `タグ一覧の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        ),
      );
    }
  },

  // IDでタグを取得（関連動画も含む）
  async getTagById(id: string): Promise<Result<TagWithVideos, ApiError>> {
    try {
      const client = getApiClient();
      const response = await client.api.tags[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        return err(handleHttpError(response.status, `ID: ${id} のタグの取得に失敗しました`));
      }

      const json = await response.json();
      const parseResult = tagResponseSchema.safeParse(json);

      if (!parseResult.success) {
        return err(createSchemaError(parseResult.error.message));
      }

      return ok(parseResult.data.tag);
    } catch (error) {
      return err(
        createNetworkError(
          `タグの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        ),
      );
    }
  },

  // タグを作成
  async createTag(data: TagInsert): Promise<Result<string, ApiError>> {
    try {
      const client = getApiClient();
      const response = await client.api.tags.$post({
        json: data,
      });

      if (!response.ok) {
        return err(handleHttpError(response.status, "タグの作成に失敗しました"));
      }

      const json = await response.json();
      const parseResult = tagCreateResponseSchema.safeParse(json);

      if (!parseResult.success) {
        return err(createSchemaError(parseResult.error.message));
      }

      return ok(parseResult.data.id);
    } catch (error) {
      return err(
        createNetworkError(
          `タグの作成中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        ),
      );
    }
  },

  // タグを更新
  async updateTag(id: string, data: TagUpdate): Promise<Result<void, ApiError>> {
    try {
      const client = getApiClient();
      const response = await client.api.tags[":id"].$patch({
        param: { id },
        json: data,
      });

      if (!response.ok) {
        return err(handleHttpError(response.status, `ID: ${id} のタグの更新に失敗しました`));
      }

      const json = await response.json();
      const parseResult = tagUpdateDeleteResponseSchema.safeParse(json);

      if (!parseResult.success) {
        return err(createSchemaError(parseResult.error.message));
      }

      return ok(undefined);
    } catch (error) {
      return err(
        createNetworkError(
          `タグの更新中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        ),
      );
    }
  },

  // タグを削除
  async deleteTag(id: string): Promise<Result<void, ApiError>> {
    try {
      const client = getApiClient();
      const response = await client.api.tags[":id"].$delete({
        param: { id },
      });

      if (!response.ok) {
        return err(handleHttpError(response.status, `ID: ${id} のタグの削除に失敗しました`));
      }

      const json = await response.json();
      const parseResult = tagUpdateDeleteResponseSchema.safeParse(json);

      if (!parseResult.success) {
        return err(createSchemaError(parseResult.error.message));
      }

      return ok(undefined);
    } catch (error) {
      return err(
        createNetworkError(
          `タグの削除中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        ),
      );
    }
  },

  // 指定したタグIDsに関連する動画IDを取得（OR条件）
  async getVideosByTagIds(tagIds: string[]): Promise<Result<string[], ApiError>> {
    try {
      const client = getApiClient();
      const response = await client.api.tags.videos.$get({
        query: { tagIds },
      });

      if (!response.ok) {
        return err(handleHttpError(response.status, "タグに関連する動画の取得に失敗しました"));
      }

      const json = await response.json();
      const parseResult = tagVideosResponseSchema.safeParse(json);

      if (!parseResult.success) {
        return err(createSchemaError(parseResult.error.message));
      }

      return ok(parseResult.data.videoIds);
    } catch (error) {
      return err(
        createNetworkError(
          `タグに関連する動画の取得中にエラーが発生しました: ${
            error instanceof Error ? error.message : "不明なエラー"
          }`,
        ),
      );
    }
  },

  // 指定したタグIDsをすべて持つ動画IDを取得（AND条件）
  async getVideosByAllTags(tagIds: string[]): Promise<Result<string[], ApiError>> {
    try {
      const client = getApiClient();
      const response = await client.api.tags.videos.all.$get({
        query: { tagIds },
      });

      if (!response.ok) {
        return err(handleHttpError(response.status, "すべてのタグを持つ動画の取得に失敗しました"));
      }

      const json = await response.json();
      const parseResult = tagVideosResponseSchema.safeParse(json);

      if (!parseResult.success) {
        return err(createSchemaError(parseResult.error.message));
      }

      return ok(parseResult.data.videoIds);
    } catch (error) {
      return err(
        createNetworkError(
          `すべてのタグを持つ動画の取得中にエラーが発生しました: ${
            error instanceof Error ? error.message : "不明なエラー"
          }`,
        ),
      );
    }
  },
};
