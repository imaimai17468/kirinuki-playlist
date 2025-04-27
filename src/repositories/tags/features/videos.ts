import { getApiClient } from "@/db/config/client";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { type Result, err, ok } from "neverthrow";
import { tagVideosResponseSchema } from "../types";

// 指定したタグIDsに関連する動画IDを取得（OR条件）
export async function getVideosByTagIds(tagIds: string[]): Promise<Result<string[], ApiError>> {
  try {
    // 空の配列の場合は早期リターン
    if (tagIds.length === 0) {
      return ok([]);
    }

    const client = getApiClient();
    const response = await client.api.tags.videos.$get({
      query: { tagIds },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const json = await response.json();
    const parseResult = tagVideosResponseSchema.safeParse(json);

    if (!parseResult.success) {
      return err(createSchemaError(parseResult.error.message));
    }

    return ok(parseResult.data.videoIds);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 指定したタグIDsをすべて持つ動画IDを取得（AND条件）
export async function getVideosByAllTags(tagIds: string[]): Promise<Result<string[], ApiError>> {
  try {
    // 空の配列の場合は早期リターン
    if (tagIds.length === 0) {
      return ok([]);
    }

    const client = getApiClient();
    const response = await client.api.tags.videos.all.$get({
      query: { tagIds },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const json = await response.json();
    const parseResult = tagVideosResponseSchema.safeParse(json);

    if (!parseResult.success) {
      return err(createSchemaError(parseResult.error.message));
    }

    return ok(parseResult.data.videoIds);
  } catch (error) {
    return err(createNetworkError(error));
  }
}
