import { getApiClient } from "@/db/config/client";
import {
  type AuthorInsert,
  type AuthorUpdate,
  type AuthorWithPlaylists,
  type AuthorWithVideos,
  type AuthorWithVideosAndPlaylists,
  authorCreateResponseSchema,
  authorResponseSchema,
  authorUpdateDeleteResponseSchema,
  authorWithPlaylistsResponseSchema,
  authorWithVideosAndPlaylistsResponseSchema,
  authorWithVideosResponseSchema,
  authorsResponseSchema,
} from "@/repositories/authors/types";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";
import type { z } from "zod";

// 作者一覧を取得
export async function getAllAuthors(): Promise<Result<z.infer<typeof authorsResponseSchema>["authors"], ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors.$get();

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = authorsResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.authors);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 作者を取得
export async function getAuthorById(
  id: string,
): Promise<Result<z.infer<typeof authorResponseSchema>["author"], ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].$get({
      param: { id },
      query: {},
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = authorResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.author);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

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

// 作者を作成
export async function createAuthor(data: AuthorInsert): Promise<Result<string, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors.$post({
      json: data,
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = authorCreateResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "著者の作成に失敗しました",
      });
    }

    return ok(result.data.id);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 作者を更新
export async function updateAuthor(id: string, data: AuthorUpdate): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].$patch({
      param: { id },
      json: data,
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = authorUpdateDeleteResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "著者の更新に失敗しました",
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// 作者を削除
export async function deleteAuthor(id: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.authors[":id"].$delete({
      param: { id },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const responseData = await response.json();
    const result = authorUpdateDeleteResponseSchema.safeParse(responseData);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    if (!result.data.success) {
      return err({
        type: "badRequest",
        message: result.data.message || "著者の削除に失敗しました",
      });
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}
