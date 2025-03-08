import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";

export const createDbClient = (db: D1Database) => {
  return drizzle(db);
};
