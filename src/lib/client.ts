import type { AppType } from "@/app/api/[...route]/route";
import { getBaseURL } from "@/lib/baseUrl";
import { hc } from "hono/client";

export const client = hc<AppType>(`${getBaseURL()}/api`);
