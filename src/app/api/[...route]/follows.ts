import { createDbClient } from "@/db/config/database";
import type { AppEnv } from "@/db/config/hono";
import { createFollowService } from "@/db/services/follows/follows";
import { getAuth } from "@/repositories/auth";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const followsRouter = new Hono<AppEnv>()
  // フォローする
  .post("/users/:id/follow", async (c) => {
    try {
      const { userId } = await getAuth();
      if (!userId) {
        return c.json({ success: false, message: "認証が必要です" }, 401);
      }

      const targetId = c.req.param("id");

      // 自分自身をフォローしようとしている場合
      if (userId === targetId) {
        return c.json({ success: false, message: "自分自身をフォローすることはできません" }, 400);
      }

      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createFollowService(dbClient);
      await service.followUser(userId, targetId);

      return c.json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("見つかりません")) {
          throw new HTTPException(404, { message: error.message });
        }
        if (error.message.includes("すでにフォローしています")) {
          return c.json({ success: false, message: error.message }, 400);
        }
      }
      console.error("フォロー処理中のエラー:", error);
      throw new HTTPException(500, {
        message: "フォロー処理中にエラーが発生しました",
      });
    }
  })

  // フォロー解除
  .delete("/users/:id/follow", async (c) => {
    try {
      const { userId } = await getAuth();
      if (!userId) {
        return c.json({ success: false, message: "認証が必要です" }, 401);
      }

      const targetId = c.req.param("id");

      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createFollowService(dbClient);
      await service.unfollowUser(userId, targetId);

      return c.json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("見つかりません")) {
          throw new HTTPException(404, {
            message: "フォロー関係が見つかりません",
          });
        }
      }
      console.error("フォロー解除中のエラー:", error);
      throw new HTTPException(500, {
        message: "フォロー解除中にエラーが発生しました",
      });
    }
  })

  // フォロワー一覧取得
  .get("/users/:id/followers", async (c) => {
    try {
      const userId = c.req.param("id");

      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createFollowService(dbClient);
      const followers = await service.getFollowers(userId);

      return c.json({ success: true, followers });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("見つかりません")) {
          throw new HTTPException(404, { message: error.message });
        }
      }
      console.error("フォロワー取得中のエラー:", error);
      throw new HTTPException(500, {
        message: "フォロワー取得中にエラーが発生しました",
      });
    }
  })

  // フォロー中一覧取得
  .get("/users/:id/following", async (c) => {
    try {
      const userId = c.req.param("id");

      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createFollowService(dbClient);
      const following = await service.getFollowing(userId);

      return c.json({ success: true, following });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("見つかりません")) {
          throw new HTTPException(404, { message: error.message });
        }
      }
      console.error("フォロー中ユーザー取得中のエラー:", error);
      throw new HTTPException(500, {
        message: "フォロー中ユーザー取得中にエラーが発生しました",
      });
    }
  })

  // フォロー状態確認
  .get("/users/:id/is-following", async (c) => {
    try {
      const { userId } = await getAuth();
      if (!userId) {
        return c.json({ success: false, message: "認証が必要です" }, 401);
      }

      const targetId = c.req.param("id");

      // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
      let dbClient = c.get("dbClient");
      if (!dbClient) {
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      }

      const service = createFollowService(dbClient);
      const isFollowing = await service.isFollowing(userId, targetId);

      return c.json({ success: true, isFollowing });
    } catch (error) {
      console.error("フォロー状態確認中のエラー:", error);
      throw new HTTPException(500, {
        message: "フォロー状態確認中にエラーが発生しました",
      });
    }
  });
