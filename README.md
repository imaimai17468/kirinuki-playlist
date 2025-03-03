# Kirinuki Playlist

モノレポ構成のTypeScriptプロジェクト

## プロジェクト構造

```
kirinuki-playlist/
├── apps/
│   ├── backend/         # Honoベースのバックエンドアプリ
│   │   ├── src/
│   │   │   └── index.ts # バックエンドのエントリーポイント
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/             # Nextベースのフロントエンドアプリ
│       ├── src/
│       │   └── app/
│       │       └── api/
│       │           └── [...route]/
│       │               └── route.ts # バックエンドAPIのプロキシ
│       ├── package.json
│       └── tsconfig.json
│
├── package.json         # ワークスペース設定
└── README.md            # このファイル
```

## セットアップ

```bash
# 依存関係のインストール
bun install

# バックエンドの開発サーバー起動
cd apps/backend
bun run dev

# フロントエンドの開発サーバー起動
cd apps/web
bun run dev
```

## 主要な設定

### モノレポ設定

ルートの`package.json`でワークスペースを設定しています：

```json
{
  "workspaces": [
    "apps/*"
  ]
}
```

### パッケージ参照

フロントエンドからバックエンドを参照する設定：

```json
// apps/web/package.json
{
  "dependencies": {
    "@kirinuki-playlist/backend": "workspace:*"
  }
}
```

バックエンドパッケージの設定：

```json
// apps/backend/package.json
{
  "name": "@kirinuki-playlist/backend",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

### TypeScript設定

バックエンドの`tsconfig.json`：

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "skipLibCheck": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## API連携

フロントエンドからバックエンドAPIを呼び出す設定：

```typescript
// apps/web/src/app/api/[...route]/route.ts
import { app as backend } from "@kirinuki-playlist/backend";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const handleDevOnly = (...args: Parameters<ReturnType<typeof handle>>) => {
  if (process.env.NODE_ENV === "development") {
    const app = new Hono().basePath("/api").route("/", backend);
    return handle(app)(...args);
  }
  return new Response(null, { status: 404 });
};

export const runtime = "nodejs";
export const GET = handleDevOnly;
export const POST = handleDevOnly;
// ...
```
