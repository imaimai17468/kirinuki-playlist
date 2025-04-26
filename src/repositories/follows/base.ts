import { getApiClient } from "@/db/config/client";
import {
  type UserWithCountsType,
  followersResponseSchema,
  followingResponseSchema,
  isFollowingResponseSchema,
} from "@/repositories/follows/types";
import type { ApiError } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";
import type { z } from "zod";

// ユーザーをフォローする
export async function followUser(userId: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.users[":id"].follow.$post({
      param: { id: userId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// ユーザーのフォローを解除する
export async function unfollowUser(userId: string): Promise<Result<void, ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.users[":id"].follow.$delete({
      param: { id: userId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    return ok(undefined);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// ユーザーのフォロワー一覧を取得（UserCardと互換性のあるデータ形式）
export async function getUserFollowers(userId: string): Promise<Result<UserWithCountsType[], ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.users[":id"].followers.$get({
      param: { id: userId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = followersResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.followers);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// ユーザーがフォローしているユーザー一覧を取得（UserCardと互換性のあるデータ形式）
export async function getUserFollowing(userId: string): Promise<Result<UserWithCountsType[], ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.users[":id"].following.$get({
      param: { id: userId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = followingResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.following);
  } catch (error) {
    return err(createNetworkError(error));
  }
}

// ユーザーをフォローしているかどうかを確認
export async function isFollowing(
  userId: string,
): Promise<Result<z.infer<typeof isFollowingResponseSchema>["isFollowing"], ApiError>> {
  try {
    const client = getApiClient();
    const response = await client.api.users[":id"]["is-following"].$get({
      param: { id: userId },
    });

    if (!response.ok) {
      return handleHttpError(response);
    }

    const data = await response.json();
    const result = isFollowingResponseSchema.safeParse(data);

    if (!result.success) {
      return err(createSchemaError(result.error.message));
    }

    return ok(result.data.isFollowing);
  } catch (error) {
    return err(createNetworkError(error));
  }
}
