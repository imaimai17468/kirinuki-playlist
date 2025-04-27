import { getApiClient } from "@/db/config/client";
import {
  type PlaylistVideoInsert,
  type PlaylistVideoUpdate,
  playlistUpdateDeleteResponseSchema,
} from "@/repositories/playlists/types";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

// プレイリストに動画を追加
export async function addVideoToPlaylist(
  playlistId: string,
  videoData: PlaylistVideoInsert,
): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.playlists[":id"].videos.$post({
      param: { id: playlistId },
      json: videoData,
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = playlistUpdateDeleteResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "プレイリストへの動画追加に失敗しました",
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// プレイリストから動画を削除
export async function removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.playlists[":playlistId"].videos[":videoId"].$delete({
      param: { playlistId, videoId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = playlistUpdateDeleteResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "プレイリストからの動画削除に失敗しました",
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// プレイリスト内の動画を更新
export async function updatePlaylistVideo(
  playlistId: string,
  videoId: string,
  data: PlaylistVideoUpdate,
): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.playlists[":playlistId"].videos[":videoId"].$patch({
      param: { playlistId, videoId },
      json: data,
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = playlistUpdateDeleteResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "プレイリスト内の動画更新に失敗しました",
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}
