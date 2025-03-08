# Kirinuki Playlist Backend

Cloudflare Workers を使用した Kirinuki Playlist のバックエンドアプリケーションです。

## 技術スタック

- [Cloudflare Workers](https://workers.cloudflare.com/) - サーバーレス実行環境
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite ベースのデータベース
- [Hono](https://hono.dev/) - 高速で軽量な Web フレームワーク
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript 用の ORM ライブラリ
- [Zod](https://zod.dev/) - TypeScript ファーストのスキーマバリデーションライブラリ
- [Bun](https://bun.sh/) - 高速な JavaScript ランタイム・パッケージマネージャー

## プロジェクト構造

```
src/
├── controllers/        # ルートハンドラー
│   └── videos.ts       # 動画関連のコントローラー
├── models/             # データモデル
│   └── videos.ts       # 動画のスキーマ定義
├── services/           # ビジネスロジック
│   └── videos.ts       # 動画関連のサービス
├── middlewares/        # ミドルウェア
│   └── error-handler.ts # エラーハンドリング
├── utils/              # ユーティリティ関数
│   └── errors.ts       # カスタムエラークラス
├── types/              # 型定義
│   └── index.ts        # 共通の型定義
├── config/             # 設定
│   └── database.ts     # データベース設定
└── index.ts            # エントリーポイント
```

## セットアップ

### 前提条件

- [Bun](https://bun.sh/) 1.0 以上
- Wrangler CLI (`bun add -g wrangler`)

### インストール

```bash
bun install
```

### 環境変数の設定

`.env`ファイルを作成し、必要な環境変数を設定します：

```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_database_id
CLOUDFLARE_D1_TOKEN=your_d1_token
```

または、`wrangler.jsonc`ファイルに直接設定することもできます。

## 開発

### ローカル開発サーバーの起動

```bash
bun run dev
```

これにより、`http://localhost:8787`でローカル開発サーバーが起動します。

### データベースマイグレーション

マイグレーションファイルの生成：

```bash
bun run generate
```

## デプロイ

Cloudflare Workers にデプロイするには：

```bash
bun run deploy
```

## API エンドポイント

### 動画 API

| メソッド | エンドポイント    | 説明             |
| -------- | ----------------- | ---------------- |
| GET      | `/api/videos`     | 動画一覧の取得   |
| GET      | `/api/videos/:id` | 特定の動画の取得 |
| POST     | `/api/videos`     | 新しい動画の作成 |
| PATCH    | `/api/videos/:id` | 動画の更新       |
| DELETE   | `/api/videos/:id` | 動画の削除       |

### ヘルスチェック

| メソッド | エンドポイント | 説明           |
| -------- | -------------- | -------------- |
| GET      | `/api/hello`   | API の稼働確認 |

## 開発ガイドライン

詳細な開発ガイドラインについては、[バックエンド開発コーディング規約](../../.cursor/rules/backend-coding-standards.mdc)を参照してください。
