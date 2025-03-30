import { getApiClient } from "@/db/config/client";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import {
  type Tag,
  type VideoInsert,
  type VideoUpdate,
  videoCreateResponseSchema,
  videoResponseSchema,
  videoTagsResponseSchema,
  videoUpdateDeleteResponseSchema,
  videosResponseSchema,
} from "@/repositories/videos/types";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";
import type { z } from "zod";

// ビデオ一覧を取得（タグ情報を含む）
export async function getAllVideos(): Promise<Result<z.infer<typeof videosResponseSchema>["videos"], ApiError>> {
  try {
    const client = getApiClient();
    // タグ情報を含む動画を取得
    const response = await client.api.videos.$get();

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = videosResponseSchema.safeParse(data);

    if (!result.success) {
      console.error("Schema validation error:", result.error.message);
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.videos);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// ビデオを取得（タグ情報を含む）
export async function getVideoById(
  id: string,
): Promise<Result<z.infer<typeof videoResponseSchema>["video"], ApiError>> {
  try {
    const client = getApiClient();
    // タグ情報を含む動画を取得
    const response = await client.api.videos[":id"].$get({
      param: { id },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = videoResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.video);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 動画を作成（タグIDを含む）
export async function createVideo(data: VideoInsert): Promise<Result<string, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.videos.$post({
      json: data,
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = videoCreateResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "動画の作成に失敗しました",
      });
    }

    return ok(result.data.id);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 動画を更新（タグIDを含む）
export async function updateVideo(id: string, data: VideoUpdate): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.videos[":id"].$patch({
      param: { id },
      json: data,
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = videoUpdateDeleteResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "動画の更新に失敗しました",
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 動画を削除
export async function deleteVideo(id: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.videos[":id"].$delete({
      param: { id },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = videoUpdateDeleteResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "動画の削除に失敗しました",
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 動画にタグを追加
export async function addTagToVideo(videoId: string, tagId: string): Promise<Result<void, ApiError>> {
  try {
    // 事前に動画が存在するか確認
    const videoResult = await getVideoById(videoId);
    if (videoResult.isErr()) {
      return err({
        type: "notFound",
        message: `ビデオID ${videoId} が見つかりません`,
      });
    }

    // タグが既に関連付けられているか確認
    const video = videoResult.value;
    const tagExists = video.tags.some((tag) => tag.id === tagId);
    if (tagExists) {
      return err({
        type: "badRequest",
        message: `ビデオID ${videoId} には既にタグID ${tagId} が関連付けられています`,
      });
    }

    const client = getApiClient();
    // HonoのRPCクライアントを使用
    const response = await client.api.videos[":id"].tags.$post({
      param: { id: videoId },
      json: { tagId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = videoTagsResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "タグの追加に失敗しました",
      });
    }

    // モックでのテスト実行時は実際のサーバー呼び出しが行われないため、
    // テスト用に成功を返すだけにする
    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 動画からタグを削除
export async function removeTagFromVideo(videoId: string, tagId: string): Promise<Result<void, ApiError>> {
  try {
    // 事前に関連付けが存在するか確認
    const videoResult = await getVideoById(videoId);
    if (videoResult.isErr()) {
      return err({
        type: "notFound",
        message: `ビデオID ${videoId} が見つかりません`,
      });
    }

    // タグの関連付けが存在するか確認
    const video = videoResult.value;
    const tagExists = video.tags.some((tag) => tag.id === tagId);
    if (!tagExists) {
      return err({
        type: "notFound",
        message: `ビデオID ${videoId} にタグID ${tagId} が関連付けられていません`,
      });
    }

    const client = getApiClient();
    // HonoのRPCクライアントを使用
    const response = await client.api.videos[":id"].tags[":tagId"].$delete({
      param: { id: videoId, tagId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = videoTagsResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "タグの削除に失敗しました",
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// ビデオに関連付けられたタグを取得
export async function getVideoTags(videoId: string): Promise<Result<Tag[], ApiError>> {
  try {
    // ビデオ自体を取得（タグ情報を含む）
    const videoResult = await getVideoById(videoId);

    if (videoResult.isErr()) {
      return err({
        type: "notFound",
        message: `ビデオID ${videoId} のタグが見つかりません`,
      });
    }

    // ビデオのタグ情報を返す
    return ok(videoResult.value.tags);
  } catch (error) {
    return err(createNetworkError(error));
  }
}
