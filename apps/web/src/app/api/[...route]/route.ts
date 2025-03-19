import { errorHandler } from "@/db/middlewares/error-handler";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { authorsRouter } from "./author";
import { videosRouter } from "./videos";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.use("*", errorHandler);

app.route("/authors", authorsRouter);
app.route("/videos", videosRouter);

// health check
app.get("/hello", (c) => c.json({ status: "ok" }));

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
