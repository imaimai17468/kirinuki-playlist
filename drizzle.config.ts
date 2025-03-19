import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

export default {
  schema: "./src/db/models/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    wranglerConfigPath: "wrangler.jsonc",
    dbName: "kirinuki-playlist",
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    databaseId: process.env.CLOUDFLARE_DATABASE_ID || "",
    token: process.env.CLOUDFLARE_D1_TOKEN || "",
  },
} satisfies Config;
