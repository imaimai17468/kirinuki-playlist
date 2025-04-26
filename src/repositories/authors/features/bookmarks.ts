import { getApiClient } from "@/db/config/client";
import {
  type AuthorWithBookmarkedPlaylists,
  type AuthorWithBookmarkedVideos,
  type AuthorWithVideosPlaylistsAndBookmarks,
  authorWithBookmarkedPlaylistsResponseSchema,
  authorWithBookmarkedVideosResponseSchema,
  authorWithVideosPlaylistsAndBookmarksResponseSchema,
  bookmarkStatusResponseSchema,
} from "@/repositories/authors/types";
import type { ApiError } from "@/repositories/types";
import { baseResponseSchema } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

// ブックマークした動画を含む作者情報を取得
export async function getAuthorBookmarkedVideos(id: string): Promise<Result<AuthorWithBookmarkedVideos, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"]["bookmarked-videos"].$get({
      param: { id },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();

    // 専用のスキーマを使って一回で検証
    const result = authorWithBookmarkedVideosResponseSchema.safeParse(data);
    if (!result.success) {
      return err(createSchemaError(`ブックマークした動画情報の検証に失敗しました: ${result.error.message}`));
    }

    return ok(result.data.author);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 動画をブックマーク
export async function bookmarkVideo(authorId: string, videoId: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].bookmarks.videos[":videoId"].$post({
      param: { id: authorId, videoId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = baseResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 動画のブックマークを解除
export async function unbookmarkVideo(authorId: string, videoId: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].bookmarks.videos[":videoId"].$delete({
      param: { id: authorId, videoId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = baseResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 動画がブックマークされているか確認
export async function hasBookmarkedVideo(authorId: string, videoId: string): Promise<Result<boolean, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].bookmarks.videos[":videoId"].$get({
      param: { id: authorId, videoId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = bookmarkStatusResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.isBookmarked);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// ブックマークしたプレイリストを含む作者情報を取得
export async function getAuthorBookmarkedPlaylists(
  id: string,
): Promise<Result<AuthorWithBookmarkedPlaylists, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"]["bookmarked-playlists"].$get({
      param: { id },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();

    // 専用のスキーマを使って一回で検証
    const result = authorWithBookmarkedPlaylistsResponseSchema.safeParse(data);
    if (!result.success) {
      return err(createSchemaError(`ブックマークしたプレイリスト情報の検証に失敗しました: ${result.error.message}`));
    }

    return ok(result.data.author);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// プレイリストをブックマーク
export async function bookmarkPlaylist(authorId: string, playlistId: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].bookmarks.playlists[":playlistId"].$post({
      param: { id: authorId, playlistId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = baseResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// プレイリストのブックマークを解除
export async function unbookmarkPlaylist(authorId: string, playlistId: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].bookmarks.playlists[":playlistId"].$delete({
      param: { id: authorId, playlistId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = baseResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// プレイリストがブックマークされているか確認
export async function hasBookmarkedPlaylist(authorId: string, playlistId: string): Promise<Result<boolean, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].bookmarks.playlists[":playlistId"].$get({
      param: { id: authorId, playlistId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = bookmarkStatusResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.isBookmarked);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 作者と動画・プレイリスト・両方のブックマークを一緒に取得
export async function getAuthorWithVideosPlaylistsAndBookmarks(
  id: string,
): Promise<Result<AuthorWithVideosPlaylistsAndBookmarks, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"]["all-with-bookmarks"].$get({
      param: { id },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();

    // 専用のスキーマを使って一回で検証
    const result = authorWithVideosPlaylistsAndBookmarksResponseSchema.safeParse(data);
    if (!result.success) {
      return err(
        createSchemaError(
          `動画、プレイリスト、ブックマーク情報を含む著者データの検証に失敗しました: ${result.error.message}`,
        ),
      );
    }

    return ok(result.data.author);
  } catch (error) {
    return err(createNetworkError(error));
  }
}
