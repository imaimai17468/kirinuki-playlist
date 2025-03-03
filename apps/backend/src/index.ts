import { Hono } from "hono";

const app = new Hono();

app.get("/hello", (c) => {
  return c.text("Hello Hono!");
});

export type AppType = typeof app;
export { app };
