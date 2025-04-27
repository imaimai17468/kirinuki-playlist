import { getApiClient } from "@/db/config/client";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { getVideoById } from "@/repositories/videos/base";
import { type Tag, videoTagsResponseSchema } from "@/repositories/videos/types";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

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
