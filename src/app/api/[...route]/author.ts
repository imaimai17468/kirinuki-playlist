import { authorInsertSchema, authorUpdateSchema } from "@/db/models/authors";
import { authorService } from "@/db/services/authors";
import type { AuthorInsert, AuthorUpdate } from "@/db/services/authors";
import type { Bindings } from "@/db/types/bindings";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export const authorsRouter = new Hono<{ Bindings: Bindings }>();

//作成者一覧の取得
authorsRouter.get("/", async (c) => {
  const { DB } = getRequestContext().env;
  const authors = await authorService.getAllAuthors(DB);
  return c.json({ success: true, authors });
});

//作成者の詳細取得
authorsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const { DB } = getRequestContext().env;
  const author = await authorService.getAuthorById(DB, id);
  return c.json({ success: true, author });
});

//作成者の追加
authorsRouter.post("/", zValidator("json", authorInsertSchema), async (c) => {
  const input = c.req.valid("json") as AuthorInsert;
  const { DB } = getRequestContext().env;
  const id = await authorService.createAuthor(DB, input);
  return c.json({ success: true, id }, 201);
});

//作成者の更新
authorsRouter.patch("/:id", zValidator("json", authorUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const input = c.req.valid("json") as AuthorUpdate;
  const { DB } = getRequestContext().env;
  await authorService.updateAuthor(DB, id, input);
  return c.json({ success: true, id });
});

//作成者の削除
authorsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const { DB } = getRequestContext().env;
  await authorService.deleteAuthor(DB, id);
  return c.json({ success: true });
});
