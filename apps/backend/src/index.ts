import type { D1Database } from "@cloudflare/workers-types";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { nanoid } from "nanoid";
import { videoInsertSchema, videoUpdateSchema, videos } from "./scheme";

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

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

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

// 動画の更新
app.patch("/videos/:id", zValidator("json", videoUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const input = c.req.valid("json");
  const db = drizzle(c.env.DB);

  try {
    // 更新データの準備（updatedAtは自動的に現在時刻に設定）
    const updateData = {
      ...input,
      updatedAt: new Date(),
    };

    // データベースを更新
    const result = await db.update(videos).set(updateData).where(eq(videos.id, id)).run();

    // 影響を受けた行数が0の場合、リソースが存在しない
    if (result.meta.changes === 0) {
      throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
    }

    return c.json({ success: true, id });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new DatabaseError(`動画の更新中にエラーが発生しました: ${error.message}`);
    }

    throw error;
  }
});

// 動画の削除
app.delete("/videos/:id", async (c) => {
  const id = c.req.param("id");
  const db = drizzle(c.env.DB);

  try {
    // データベースから削除
    const result = await db.delete(videos).where(eq(videos.id, id)).run();

    // 影響を受けた行数が0の場合、リソースが存在しない
    if (result.meta.changes === 0) {
      throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
    }

    return c.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new DatabaseError(`動画の削除中にエラーが発生しました: ${error.message}`);
    }

    throw error;
  }
});

// 動画の詳細取得
app.get("/videos/:id", async (c) => {
  const id = c.req.param("id");
  const db = drizzle(c.env.DB);

  try {
    const video = await db.select().from(videos).where(eq(videos.id, id)).get();

    if (!video) {
      throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
    }

    return c.json({ success: true, video });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new DatabaseError(`動画の取得中にエラーが発生しました: ${error.message}`);
    }

    throw error;
  }
});

export default app;
