import { err } from "neverthrow";
import type { Result } from "neverthrow";
import type { ApiError } from "./types";

// HTTPエラーを適切なApiErrorに変換する関数
export function handleHttpError(response: Response): Result<never, ApiError> {
  switch (response.status) {
    case 404:
      return err({
        type: "notFound",
        message: "リソースが見つかりませんでした",
      });
    case 400:
      return err({
        type: "badRequest",
        message: "リクエストが不正です",
      });
    default:
      return err({
        type: "serverError",
        message: `サーバーエラー: ${response.status}`,
      });
  }
}

// ネットワークエラーを作成する関数
export function createNetworkError(error: unknown): ApiError {
  return {
    type: "network",
    message: error instanceof Error ? error.message : "不明なエラーが発生しました",
  };
}

// スキーマ検証エラーを作成する関数
export function createSchemaError(errorMessage: string): ApiError {
  return {
    type: "badRequest",
    message: `スキーマ検証エラー: ${errorMessage}`,
  };
}
