import type { AppType } from "@/app/api/[...route]/route";
import { getBaseURL } from "@/libs/baseUrl";
import { hc } from "hono/client";

export const client = hc<AppType>(`${getBaseURL()}/api`);
