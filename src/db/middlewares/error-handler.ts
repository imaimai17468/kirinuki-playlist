import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Bindings } from "../types/bindings";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../utils/errors";

export const errorHandler: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  try {
    await next();
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      return c.json(
        {
          success: false,
          error: "不明なエラー",
          message: "予期しないエラーが発生しました",
        },
        500,
      );
    }

    console.error(`[Error] ${err.message}`, err.stack);

    // カスタムエラーの処理
    if (err instanceof UniqueConstraintError) {
      return c.json(
        {
          success: false,
          error: "重複エラー",
          message: err.message,
        },
        409,
      );
    }

    if (err instanceof DatabaseError) {
      return c.json(
        {
          success: false,
          error: "データベースエラー",
          message: err.message,
        },
        500,
      );
    }

    if (err instanceof NotFoundError) {
      return c.json(
        {
          success: false,
          error: "リソースが見つかりません",
          message: err.message,
        },
        404,
      );
    }

    // Zodバリデーションエラーの処理
    if (err instanceof HTTPException && err.status === 400) {
      return c.json(
        {
          success: false,
          error: "バリデーションエラー",
          details: err.message,
        },
        400,
      );
    }

    // その他のエラー
    return c.json(
      {
        success: false,
        error: err.name === "ZodError" ? err : "サーバーエラー",
        message: "予期しないエラーが発生しました",
      },
      500,
    );
  }
};
