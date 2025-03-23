import { getApiClient } from "@/db/config/client";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { videoResponseSchema, videosResponseSchema } from "@/repositories/videos/types";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";
import type { z } from "zod";

// ビデオ一覧を取得
export async function getAllVideos(): Promise<Result<z.infer<typeof videosResponseSchema>["videos"], ApiError>> {
  try {
    const client = getApiClient();
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

// ビデオを取得
export async function getVideoById(
  id: string,
): Promise<Result<z.infer<typeof videoResponseSchema>["video"], ApiError>> {
  try {
    const client = getApiClient();
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
