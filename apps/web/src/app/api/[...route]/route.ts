import app from "@kirinuki-playlist/backend";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const handleDevOnly = (...args: Parameters<ReturnType<typeof handle>>) => {
  if (process.env.NODE_ENV === "development") {
    const hono = new Hono().basePath("/api").route("/", app);
    return handle(hono)(...args);
  }
  return new Response(null, { status: 404 });
};

export const runtime = "nodejs";
export const GET = handleDevOnly;
export const POST = handleDevOnly;
export const PUT = handleDevOnly;
export const PATCH = handleDevOnly;
export const DELETE = handleDevOnly;
