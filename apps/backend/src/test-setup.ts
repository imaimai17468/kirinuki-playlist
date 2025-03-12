import { afterAll } from "@jest/globals";
import { Miniflare } from "miniflare";
import type { Bindings } from "./types";

// Miniflareインスタンスを作成
const mf = new Miniflare({
  modules: true,
  script: "",
  d1Databases: ["DB"],
  d1Persist: false, // インメモリデータベースを使用
});

// グローバル関数として定義
global.getMiniflareBindings = async (): Promise<Bindings> => {
  const env = await mf.getBindings();
  return env as Bindings;
};

// テスト終了時にMiniflareをクローズ
afterAll(async () => {
  await mf.dispose();
});
