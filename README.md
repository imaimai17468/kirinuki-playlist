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

## ✨ プロジェクト概要

Kirinuki Playlist は、YouTube 動画から必要な部分だけを切り取り（切り抜き）、カスタムプレイリストを作成できるモダンな Web アプリケーションです。Next.js と Hono の組み合わせにより、高速なフロントエンドとバックエンドを実現しています。

- 💻 **SSR & CSR** - サーバーサイドレンダリングとクライアントサイドレンダリングを最適に組み合わせ
- 🔄 **Edge API** - グローバルエッジネットワークで低レイテンシな API
- 🛠️ **タイプセーフ** - コードベース全体でのエンドツーエンドの型安全性
- 🎨 **モダン UI** - 美しく使いやすいインターフェース

## 🚀 技術スタック

### ⚛️ フロントエンド

- **[Next.js 14](https://nextjs.org/)** - React ベースのフルスタックフレームワーク
- **[React](https://react.dev/)** - 宣言的 UI ライブラリ
- **[TypeScript](https://www.typescriptlang.org/)** - 型安全な JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - ユーティリティファースト CSS フレームワーク
- **[Shadcn UI](https://ui.shadcn.com/)** - 美しく再利用可能な UI コンポーネント

### 🔌 バックエンド

- **[Hono](https://hono.dev/)** - 軽量で高速な Web フレームワーク
- **[Edge Runtime](https://vercel.com/docs/functions/edge-functions)** - 高速かつスケーラブルなエッジコンピューティング
- **[Drizzle ORM](https://orm.drizzle.team/)** - モダンな TypeScript ORM
- **[Zod](https://zod.dev/)** - TypeScript ファーストのスキーマバリデーション

### 🛠️ 開発ツール

- **[Bun](https://bun.sh/)** - 高速な JavaScript ランタイム＆パッケージマネージャー
- **[Biome](https://biomejs.dev/)** - 高速な静的解析＆フォーマッター
- **[Lefthook](https://github.com/evilmartians/lefthook)** - 効率的な Git フック管理

### 🚢 デプロイ

- **[Vercel](https://vercel.com/)** - グローバルエッジネットワークでのシームレスなデプロイ
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** - 分散 SQL データベース

## 🧪 テスト

このプロジェクトは Bun を使用してテストを実行します。リポジトリ層のテストはデータベース操作をモックせず、インメモリ SQLite データベースを使用して実際のデータベース操作をテストします。

```bash
# すべてのテストを実行
bun test

# テストを監視モードで実行（変更を検知して再実行）
bun test --watch

# 特定のファイルまたはディレクトリのテストのみ実行
bun test src/repositories
```

### リポジトリテストについて

リポジトリ層のテストでは、依存性注入（DI）パターンを使用して、テスト環境ではインメモリデータベースを使用します。これにより、実際のデータベース操作をテストできます。

テスト用のユーティリティ関数は `src/repositories/testUtils.ts` に定義されています。これらの関数を使用して、テスト用のデータベースクライアントを作成し、テストデータをシードします。

```typescript
// テスト例
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { setupTestRepository, cleanupTestRepository } from "../../testUtils";
import { authorRepository } from "../authorRepository";

describe("authorRepository", () => {
  let db;

  beforeEach(async () => {
    // テスト用DBをセットアップ
    const setup = await setupTestRepository();
    db = setup.db;
  });

  afterEach(async () => {
    // テスト後のクリーンアップ
    await cleanupTestRepository(db);
  });

  it("テストケース", async () => {
    // テストコード
  });
});
```

## 🔄 開発ワークフロー

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動
bun run dev
```
