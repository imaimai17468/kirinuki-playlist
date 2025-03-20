import { client } from "@/libs/client";
import type { ApiError } from "@/repositories/types";
import { authorResponseSchema, authorsResponseSchema } from "@/repositories/types";
import { createNetworkError, createSchemaError, handleHttpError } from "@/repositories/utils";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";
import type { z } from "zod";

// 作者一覧を取得
export async function getAllAuthors(): Promise<Result<z.infer<typeof authorsResponseSchema>["authors"], ApiError>> {
  try {
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
    const response = await client.api.authors[":id"].$get({
      param: { id },
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
