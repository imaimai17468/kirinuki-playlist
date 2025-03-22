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
│   ├── db/
│   │   ├── config/               # データベース設定
│   │   ├── models/               # データモデル
│   │   └── services/             # データアクセスサービス
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

## 🧩 アーキテクチャ

### 依存性注入パターン

サーバーサイドのサービス層では依存性注入（DI）パターンを採用しています。各サービスは`create*Service`関数によって生成され、必要な依存関係（DB クライアントなど）が注入されます。これにより、テスト容易性と柔軟性が向上しています。

### API クライアント管理

フロントエンドからの API 呼び出しには、シングルトンパターンを採用した API クライアント管理を実装しています。リポジトリ層では`getApiClient()`関数を使用して API クライアントを取得することで、テスト時のモック化やクライアント設定の一元管理が容易になりました。

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

リポジトリ層のテストでは、依存性注入（DI）パターンを使用して、テスト環境ではインメモリデータベースを使用します。これにより、実際のデータベース操作をテストできます。テスト用のユーティリティ関数を使用して、テスト用のデータベースクライアントを作成し、テストデータをシードする仕組みが整っています。

### API クライアントテスト

API クライアントのテストでは、`setApiClient()`関数を使用してモッククライアントを注入できます。これにより、実際のネットワークリクエストを発生させることなく、リポジトリ層の機能を効率的にテストできます。

## 🔄 開発ワークフロー

### 基本的な開発フロー

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動（フロントエンドのみ）
bun run dev
```

### データベースを含む完全な開発環境の起動

このプロジェクトは Cloudflare D1 データベースを使用していますが、ローカル開発では`libsql-server`（Docker）を使用してデータベースサーバーを実行します。

```bash
# データベースサーバーの起動、マイグレーション実行、開発サーバー起動を一括で行う
bun run dev:with-db

# または、以下の手順で個別に実行することもできます
```

#### 個別のセットアップ手順

1. **データベースサーバーの起動**

```bash
# Dockerを使用してlibsql-serverを起動
bun run db:server
```

2. **データベースマイグレーションの実行**

```bash
# マイグレーションスクリプトを実行
bun run migrate:server
```

3. **テストデータの投入（必要な場合）**

```bash
# シードデータを投入
bun run seed

# またはマイグレーションと一緒にシードデータを投入する場合
bun run seed:with-migrate
```

4. **開発サーバーの起動**

```bash
# 開発サーバーを起動
bun run dev
```

#### その他の便利なコマンド

```bash
# データベースサーバーの停止
bun run db:server:stop

# Drizzleによるマイグレーションファイルの生成
bun run generate

# Drizzleによるマイグレーションの実行
bun run migrate

# ローカルのWranglerを使用したマイグレーション
bun run migrate:local
```

### プレビューとデプロイ

```bash
# Cloudflare Pagesのプレビュー
bun run preview

# Cloudflare Pagesへのデプロイ
bun run deploy
```
