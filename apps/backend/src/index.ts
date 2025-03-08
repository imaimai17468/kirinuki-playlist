import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { videos, videoInsertSchema } from "./scheme";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { nanoid } from "nanoid";

// カスタムエラークラス
class UniqueConstraintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UniqueConstraintError";
  }
}

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("api");

// グローバルエラーハンドラー
app.onError((err: Error, c) => {
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
});

app.get("/hello", (c) => {
  return c.text("Hello Hono!");
});

app.get("/videos", async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const result = await db.select().from(videos).all();
    return c.json({ success: true, videos: result });
  } catch (_) {
    throw new DatabaseError("動画一覧の取得に失敗しました");
  }
});

app.post("/videos", zValidator("json", videoInsertSchema), async (c) => {
  const input = c.req.valid("json");
  const db = drizzle(c.env.DB);

  // 現在の日時
  const now = new Date();

  // nanoidを生成
  const id = nanoid();

  try {
    // データベースに挿入
    await db.insert(videos).values({
      id,
      title: input.title,
      url: input.url,
      start: input.start,
      end: input.end,
      createdAt: now,
      updatedAt: now,
    });

    return c.json({ success: true, id }, 201);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        throw new UniqueConstraintError("この動画IDはすでに使用されています");
      }

      throw new DatabaseError("動画の保存中にエラーが発生しました");
    }

    throw error;
  }
});

export default app;
