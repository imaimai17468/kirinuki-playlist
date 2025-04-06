import { createDbClient } from "@/db/config/database";
import type { AppEnv } from "@/db/config/hono";
import { authors } from "@/db/models/authors";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { Webhook } from "svix";

// Webhookルーターの作成
export const webhookRouter = new Hono<AppEnv>()
  // テスト用エンドポイント
  .get("/clerk-test", (c) => {
    console.log("🧪 Webhook test endpoint accessed");
    return c.json({
      success: true,
      message: "Webhook test endpoint is working",
      timestamp: new Date().toISOString(),
    });
  })
  // Clerk Webhookエンドポイント
  .post("/clerk", async (c) => {
    console.log("🔔 Webhook request received");

    // WebhookのシークレットキーをClerk環境変数から取得
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("❌ CLERK_WEBHOOK_SECRET is not set");
      return c.json({ success: false, message: "Webhook secret not set" }, 500);
    }

    // リクエストヘッダーを取得
    const svix_id = c.req.header("svix-id");
    const svix_timestamp = c.req.header("svix-timestamp");
    const svix_signature = c.req.header("svix-signature");

    console.log("📋 Headers:", {
      svix_id: svix_id || "missing",
      svix_timestamp: svix_timestamp || "missing",
      svix_signature: svix_signature ? "present" : "missing",
    });

    // 必要なヘッダーが存在するか確認
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("❌ Missing Svix headers");
      return c.json({ success: false, message: "Error occurred - missing svix headers" }, 400);
    }

    let payload: Record<string, unknown>;
    try {
      // リクエストボディを取得
      payload = await c.req.json();
      console.log("📦 Payload type:", payload.type);
    } catch (err) {
      console.error("❌ Error parsing request body:", err);
      return c.json({ success: false, message: "Error parsing request body" }, 400);
    }

    const body = JSON.stringify(payload);

    // コンテキストからdbClientを取得するか、ない場合は従来通りの方法で取得
    let dbClient = c.get("dbClient");
    if (!dbClient) {
      try {
        console.log("🔄 Getting DB client from context failed, falling back to direct connection");
        const { getRequestContext } = await import("@cloudflare/next-on-pages");
        const { DB } = getRequestContext().env;
        dbClient = createDbClient(DB);
      } catch (err) {
        console.error("❌ Failed to get DB client:", err);
        return c.json({ success: false, message: "Database connection error" }, 500);
      }
    }

    // svixを使用してWebhookの署名を検証
    let event: WebhookEvent;
    try {
      console.log("🔐 Verifying webhook signature");
      const wh = new Webhook(WEBHOOK_SECRET);
      event = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
      console.log("✅ Webhook signature verified");
    } catch (err) {
      console.error("❌ Error verifying webhook:", err);
      return c.json({ success: false, message: "Error verifying webhook" }, 400);
    }

    // イベントの種類に応じてデータベース操作を実行
    const eventType = event.type;
    console.log(`📣 Processing event type: ${eventType}`);

    // ユーザー作成イベントのみ処理
    if (eventType === "user.created") {
      const { id, email_addresses, image_url, username, first_name, last_name } = event.data;

      // IDが存在しない場合は処理しない
      if (!id) {
        console.error("❌ Invalid user data: missing id");
        return c.json({ success: false, message: "Invalid user data: missing id" }, 400);
      }

      // 名前の設定（フルネームまたはユーザー名）
      const name =
        first_name && last_name
          ? `${first_name} ${last_name}`
          : username || email_addresses?.[0]?.email_address?.split("@")[0] || "Unknown User";

      // プロフィール画像URL
      const iconUrl = image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

      console.log(`👤 Creating user: ${id} (${name})`);

      try {
        // データベースにユーザーを作成
        await dbClient.insert(authors).values({
          id,
          name,
          iconUrl,
          bio: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`✅ User created: ${id}`);
        return c.json({ success: true, message: "User created" }, 201);
      } catch (error) {
        console.error("❌ Error creating user:", error);
        return c.json({ success: false, message: "Error creating user" }, 500);
      }
    }

    // ユーザー情報更新イベントの処理
    if (eventType === "user.updated") {
      const { id, image_url, username, first_name, last_name } = event.data;

      if (!id) {
        console.error("❌ Invalid user data: missing id");
        return c.json({ success: false, message: "Invalid user data: missing id" }, 400);
      }

      // 名前の設定（フルネームまたはユーザー名）
      const name = first_name && last_name ? `${first_name} ${last_name}` : username || "Unknown User";

      // プロフィール画像URL
      const iconUrl = image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

      console.log(`👤 Updating user: ${id} (${name})`);

      try {
        // ユーザーの存在確認
        const existingUser = await dbClient.select().from(authors).where(eq(authors.id, id)).get();

        if (!existingUser) {
          console.error(`❌ User not found: ${id}`);
          return c.json({ success: false, message: "User not found" }, 404);
        }

        // データベースのユーザー情報を更新
        await dbClient
          .update(authors)
          .set({
            name,
            iconUrl,
            updatedAt: new Date(),
          })
          .where(eq(authors.id, id));

        console.log(`✅ User updated: ${id}`);
        return c.json({ success: true, message: "User updated" });
      } catch (error) {
        console.error("❌ Error updating user:", error);
        return c.json({ success: false, message: "Error updating user" }, 500);
      }
    }

    // ユーザー削除イベントの処理
    if (eventType === "user.deleted") {
      const { id } = event.data;

      if (!id) {
        console.error("❌ Invalid user data: missing id");
        return c.json({ success: false, message: "Invalid user data: missing id" }, 400);
      }

      console.log(`👤 Deleting user: ${id}`);

      try {
        // ユーザーの存在確認
        const existingUser = await dbClient.select().from(authors).where(eq(authors.id, id)).get();

        if (!existingUser) {
          console.log(`⚠️ User already deleted or not found: ${id}`);
          return c.json({
            success: true,
            message: "User already deleted or not found",
          });
        }

        // データベースからユーザーを削除
        await dbClient.delete(authors).where(eq(authors.id, id));

        console.log(`✅ User deleted: ${id}`);
        return c.json({ success: true, message: "User deleted" });
      } catch (error) {
        console.error("❌ Error deleting user:", error);
        return c.json({ success: false, message: "Error deleting user" }, 500);
      }
    }

    // 他のイベントタイプは単に成功レスポンスを返す
    console.log("✅ Webhook processed successfully");
    return c.json({ success: true, message: "Webhook received" });
  });
