import { getApiClient } from "@/db/config/client";
import {
  type PlaylistInsert,
  type PlaylistUpdate,
  type PlaylistVideoInsert,
  playlistCreateResponseSchema,
  playlistResponseSchema,
  playlistUpdateDeleteResponseSchema,
  playlistsResponseSchema,
} from "@/repositories/playlists/types";
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

// プレイリストを作成
export async function createPlaylist(data: PlaylistInsert): Promise<Result<string, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.playlists.$post({
      json: data,
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = playlistCreateResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "プレイリストの作成に失敗しました",
      });
    }

    return ok(result.data.id);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// プレイリストを更新
export async function updatePlaylist(id: string, data: PlaylistUpdate): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.playlists[":id"].$patch({
      param: { id },
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
        message: result.data.message || "プレイリストの更新に失敗しました",
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// プレイリストを削除
export async function deletePlaylist(id: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.playlists[":id"].$delete({
      param: { id },
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
        message: result.data.message || "プレイリストの削除に失敗しました",
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

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
