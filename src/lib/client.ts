import { getBaseURL } from "@/lib/baseUrl";
import type { AppType } from "@kirinuki-playlist/backend";
import { hc } from "hono/client";

export const client = hc<AppType>(`${getBaseURL()}/api`);
