import { getApiClient } from "@/db/config/client";
import {
  type AuthorWithCounts,
  type AuthorWithVideosPlaylistsAndCounts,
  authorWithCountsResponseSchema,
  authorWithVideosPlaylistsAndCountsResponseSchema,
  authorsWithCountsResponseSchema,
} from "@/repositories/authors/types";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";
import type { z } from "zod";

// カウント情報を含む作者一覧を取得
export async function getAllAuthorsWithCounts(): Promise<
  Result<z.infer<typeof authorsWithCountsResponseSchema>["authors"], ApiError>
> {
  try {
    const client = getApiClient();
    const response = await client.api.authors.$get({
      query: { withCounts: "true" },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = authorsWithCountsResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(`著者一覧とカウント情報の検証に失敗しました: ${result.error.message}`));
    }

    return ok(result.data.authors);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 作者とカウント情報を一緒に取得
export async function getAuthorWithCounts(id: string): Promise<Result<AuthorWithCounts, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].$get({
      param: { id },
      query: { withCounts: "true" },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();

    // 専用のスキーマを使って一回で検証
    const result = authorWithCountsResponseSchema.safeParse(data);
    if (!result.success) {
      return err(createSchemaError(`カウント情報を含む著者データの検証に失敗しました: ${result.error.message}`));
    }

    return ok(result.data.author);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 作者と動画・プレイリスト・カウント情報を一緒に取得
export async function getAuthorWithVideosPlaylistsAndCounts(
  id: string,
): Promise<Result<AuthorWithVideosPlaylistsAndCounts, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].$get({
      param: { id },
      query: {
        withVideosAndPlaylists: "true",
        withCounts: "true",
      },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();

    // 専用のスキーマを使って一回で検証
    const result = authorWithVideosPlaylistsAndCountsResponseSchema.safeParse(data);
    if (!result.success) {
      return err(
        createSchemaError(
          `動画、プレイリスト、カウント情報を含む著者データの検証に失敗しました: ${result.error.message}`,
        ),
      );
    }

    return ok(result.data.author);
  } catch (error) {
    return err(createNetworkError(error));
  }
}
