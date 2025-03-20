# Kirinuki Playlist

Next.js アプリケーション内に Hono を統合した TypeScript プロジェクト

## プロジェクト構造

```
kirinuki-playlist/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── [...route]/
│   │   │       ├── route.ts      # HonoベースのバックエンドAPI
│   │   │       ├── videos.ts     # 動画関連のルーター
│   │   │       ├── playlists.ts  # プレイリスト関連のルーター
│   │   │       └── author.ts     # 著者関連のルーター
│   │   └── ...                   # その他のNext.jsページ
│   ├── components/               # UIコンポーネント
│   ├── db/                       # データベース関連
│   ├── libs/                     # ユーティリティ
│   ├── hooks/                    # Reactフック
│   └── repositories/             # データアクセス層
│
├── drizzle/                      # Drizzle ORM関連ファイル
├── public/                       # 静的ファイル
├── package.json                  # 依存関係
├── next.config.mjs               # Next.js設定
├── drizzle.config.ts             # Drizzle設定
└── README.md                     # このファイル
```

## セットアップ

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動
bun run dev
```

## 主要な設定

### TypeScript 設定

プロジェクトの`tsconfig.json`：

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "types": ["web", "bun-types"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## API 実装

Next.js の App Router と Hono を統合して API を実装：

```typescript
// src/app/api/[...route]/route.ts
import { errorHandler } from "@/db/middlewares/error-handler";
import type { Bindings } from "@/db/types/bindings";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { authorsRouter } from "./author";
import { playlistsRouter } from "./playlists";
import { videosRouter } from "./videos";

export const runtime = "edge";

const app = new Hono<{ Bindings: Bindings }>()
  .basePath("/api")
  .use("*", errorHandler)
  .route("/authors", authorsRouter)
  .route("/videos", videosRouter)
  .route("/playlists", playlistsRouter)
  .get("/hello", (c) => c.json({ status: "ok" }));

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
```

個別のルーターを使って機能ごとに API を分割しています：

```typescript
// src/app/api/[...route]/videos.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const videosRouter = new Hono();

// APIエンドポイントの実装
videosRouter.get("/", async (c) => {
  // 動画一覧の取得処理
  return c.json({
    /* ... */
  });
});

export { videosRouter };
```
