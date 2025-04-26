import { getApiClient } from "@/db/config/client";
import {
  type AuthorWithPlaylists,
  type AuthorWithVideos,
  type AuthorWithVideosAndPlaylists,
  authorWithPlaylistsResponseSchema,
  authorWithVideosAndPlaylistsResponseSchema,
  authorWithVideosResponseSchema,
} from "@/repositories/authors/types";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

// 作者と動画を一緒に取得
export async function getAuthorWithVideos(id: string): Promise<Result<AuthorWithVideos, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].$get({
      param: { id },
      query: { withVideos: "true" },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();

    // 専用のスキーマを使って一回で検証
    const result = authorWithVideosResponseSchema.safeParse(data);
    if (!result.success) {
      return err(createSchemaError(`動画情報を含む著者データの検証に失敗しました: ${result.error.message}`));
    }

    return ok(result.data.author);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 作者とプレイリストを一緒に取得
export async function getAuthorWithPlaylists(id: string): Promise<Result<AuthorWithPlaylists, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].$get({
      param: { id },
      query: { withPlaylists: "true" },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();

    // 専用のスキーマを使って一回で検証
    const result = authorWithPlaylistsResponseSchema.safeParse(data);
    if (!result.success) {
      return err(createSchemaError(`プレイリスト情報を含む著者データの検証に失敗しました: ${result.error.message}`));
    }

    return ok(result.data.author);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 作者と動画、プレイリストを一緒に取得
export async function getAuthorWithVideosAndPlaylists(
  id: string,
): Promise<Result<AuthorWithVideosAndPlaylists, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].$get({
      param: { id },
      query: { withVideosAndPlaylists: "true" },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();

    // 専用のスキーマを使って一回で検証
    const result = authorWithVideosAndPlaylistsResponseSchema.safeParse(data);
    if (!result.success) {
      return err(
        createSchemaError(`動画とプレイリスト情報を含む著者データの検証に失敗しました: ${result.error.message}`),
      );
    }

    return ok(result.data.author);
  } catch (error) {
    return err(createNetworkError(error));
  }
}
