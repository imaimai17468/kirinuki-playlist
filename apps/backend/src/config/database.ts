import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";

export const createDbClient = (db: D1Database) => {
  // @ts-ignore D1Database types mismatch between @cloudflare/workers-types and @miniflare/d1
  return drizzle(db);
};
