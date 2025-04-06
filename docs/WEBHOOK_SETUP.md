# Clerk Webhook 設定ガイド

このドキュメントでは、Kirinuki-Playlist アプリケーションで使用する Clerk Webhook の設定方法について説明します。

## 概要

Clerk Webhook を使用すると、ユーザーアカウントに関連するイベント（作成、更新、削除など）が発生したときに自動的に通知を受け取り、アプリケーションのデータベースと同期することができます。

## 実装済み機能

現在、次のイベントに対応しています：

- `user.created`: 新しいユーザーが登録したとき（実装済み）
- `user.updated`: ユーザー情報が更新されたとき（実装済み）
- `user.deleted`: ユーザーアカウントが削除されたとき（実装済み）

## 設定手順

### 1. Webhook エンドポイントの準備

アプリケーションには、Webhook リクエストを処理するためのエンドポイントが既に実装されています：

```
/api/webhook/clerk
```

### 2. Clerk Dashboard での設定

1. [Clerk Dashboard](https://dashboard.clerk.dev/)にログインします。

2. 左側のナビゲーションから「**Webhooks**」を選択します。

3. 「**+ Add Endpoint**」ボタンをクリックします。

4. 次の情報を入力します：

   - **Endpoint URL**: `https://あなたのドメイン/api/webhook/clerk`（デプロイ環境の URL を入力）
   - **Message Filtering**: 以下のイベントを選択
     - `user.created`
     - `user.updated`
     - `user.deleted`
   - **Version**: 最新バージョンを選択

5. 「**Create**」ボタンをクリックします。

6. 作成された Webhook の詳細画面で「**Signing Secret**」を確認します。このシークレットキーを `.env` ファイルの `CLERK_WEBHOOK_SECRET` 変数に設定します。

```
CLERK_WEBHOOK_SECRET=whsec_あなたのシークレットキー
```

### 3. ローカル開発環境でのテスト

ローカル開発環境で Webhook をテストするには、[ngrok](https://ngrok.com/)などのツールを使用して、ローカルサーバーを一時的に公開 URL で利用可能にする必要があります。

```bash
# ngrokをインストール
npm install -g ngrok

# ローカルサーバーを公開（Nextjsのデフォルトポート3000を使用）
ngrok http 3000
```

ngrok が生成した公開 URL を Clerk Dashboard のエンドポイント設定に使用します。

### 4. Webhook のデバッグ

Clerk Dashboard の「Webhook」セクションには、各 Webhook リクエストの履歴が表示されます。ここで送信されたイベントの詳細と、アプリケーションからのレスポンスを確認できます。

## トラブルシューティング

1. **認証エラー**: Webhook リクエストが 401 または 403 エラーで失敗する場合は、`.env`ファイルの`CLERK_WEBHOOK_SECRET`が正しく設定されているか確認してください。

2. **Webhook が発火しない**: Clerk Dashboard で該当するイベントが選択されているか確認してください。

3. **データベースエラー**: アプリケーションのログでエラーメッセージを確認し、データベース接続やスキーマの問題がないか検証してください。

## セキュリティに関する注意事項

- Webhook Secret は機密情報です。リポジトリにコミットしないよう注意してください。
- 本番環境では、HTTPS エンドポイントのみを使用してください。
- Webhook 処理中に発生したエラーは適切にログに記録し、必要に応じて管理者に通知するよう設定してください。
