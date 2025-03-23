import { z } from "zod";

// APIエラーの型定義
export type ApiError =
  | { type: "network"; message: string }
  | { type: "notFound"; message: string }
  | { type: "badRequest"; message: string }
  | { type: "serverError"; message: string };

// 基本的なAPIレスポンスのスキーマ
export const baseResponseSchema = z.object({
  success: z.boolean(),
});
