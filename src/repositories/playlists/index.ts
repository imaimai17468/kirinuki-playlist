import { getApiClient } from "@/db/config/client";
import { playlistResponseSchema, playlistsResponseSchema } from "@/repositories/playlists/types";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";
import type { z } from "zod";

// プレイリスト一覧を取得
export async function getAllPlaylists(): Promise<
  Result<z.infer<typeof playlistsResponseSchema>["playlists"], ApiError>
> {
  try {
    const client = getApiClient();
    const response = await client.api.playlists.$get();

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = playlistsResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.playlists);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// プレイリストを取得
export async function getPlaylistById(
  id: string,
): Promise<Result<z.infer<typeof playlistResponseSchema>["playlist"], ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.playlists[":id"].$get({
      param: { id },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = playlistResponseSchema.safeParse(data);

    if (!result.success) {
      console.error(result.error);
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.playlist);
  } catch (error) {
    return err(createNetworkError(error));
  }
}
