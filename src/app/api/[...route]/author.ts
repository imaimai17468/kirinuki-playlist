import { createDbClient } from "@/db/config/database";
import { authorInsertSchema, authorUpdateSchema } from "@/db/models/authors";
import { createAuthorService } from "@/db/services/authors";
import type { AuthorInsert, AuthorUpdate } from "@/db/services/authors";
import type { Bindings } from "@/db/types/bindings";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

// 依存性を格納するための型定義
type Variables = {
  dbClient?: ReturnType<typeof createDbClient>;
};

// Bindings型とVariables型を持つ環境型
type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

export const authorsRouter = new Hono<AppEnv>()
  // 作成者一覧の取得
  .get("/", async (c) => {
    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);
    const authors = await service.getAllAuthors();
    return c.json({ success: true, authors });
  })
  // 作成者の詳細取得
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);
    const author = await service.getAuthorById(id);
    return c.json({ success: true, author });
  })
  // 作成者の追加
  .post("/", zValidator("json", authorInsertSchema), async (c) => {
    const input = c.req.valid("json") as AuthorInsert;

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);
    const id = await service.createAuthor(input);
    return c.json({ success: true, id }, 201);
  })
  // 作成者の更新
  .patch("/:id", zValidator("json", authorUpdateSchema), async (c) => {
    const id = c.req.param("id");
    const input = c.req.valid("json") as AuthorUpdate;

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);
    await service.updateAuthor(id, input);
    return c.json({ success: true, id });
  })
  // 作成者の削除
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      const { DB } = getRequestContext().env;
      dbClient = createDbClient(DB);
    }

    const service = createAuthorService(dbClient);
    await service.deleteAuthor(id);
    return c.json({ success: true });
  });
