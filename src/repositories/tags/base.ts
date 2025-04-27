import { getApiClient } from "@/db/config/client";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { type Result, err, ok } from "neverthrow";
import {
  type TagInsert,
  type TagUpdate,
  type TagWithVideos,
  tagCreateResponseSchema,
  tagResponseSchema,
  tagUpdateDeleteResponseSchema,
  tagsResponseSchema,
} from "./types";

// 全てのタグを取得
export async function getAllTags(): Promise<Result<TagWithVideos[], ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.tags.$get();

    if (!response.ok) {
      return handleHttpError(response);
    }

    const json = await response.json();
    const parseResult = tagsResponseSchema.safeParse(json);

    if (!parseResult.success) {
      return err(createSchemaError(parseResult.error.message));
    }

    return ok(parseResult.data.tags);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// IDでタグを取得（関連動画も含む）
export async function getTagById(id: string): Promise<Result<TagWithVideos, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.tags[":id"].$get({
      param: { id },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const json = await response.json();
    const parseResult = tagResponseSchema.safeParse(json);

    if (!parseResult.success) {
      return err(createSchemaError(parseResult.error.message));
    }

    return ok(parseResult.data.tag);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// タグを作成
export async function createTag(data: TagInsert): Promise<Result<string, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.tags.$post({
      json: data,
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const json = await response.json();
    const parseResult = tagCreateResponseSchema.safeParse(json);

    if (!parseResult.success) {
      return err(createSchemaError(parseResult.error.message));
    }

    return ok(parseResult.data.id);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// タグを更新
export async function updateTag(id: string, data: TagUpdate): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.tags[":id"].$patch({
      param: { id },
      json: data,
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const json = await response.json();
    const parseResult = tagUpdateDeleteResponseSchema.safeParse(json);

    if (!parseResult.success) {
      return err(createSchemaError(parseResult.error.message));
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// タグを削除
export async function deleteTag(id: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.tags[":id"].$delete({
      param: { id },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const json = await response.json();
    const parseResult = tagUpdateDeleteResponseSchema.safeParse(json);

    if (!parseResult.success) {
      return err(createSchemaError(parseResult.error.message));
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}
