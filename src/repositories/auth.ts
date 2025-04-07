import { auth as clerkAuth } from "@clerk/nextjs/server";

// テスト用の固定ユーザーID
const TEST_USER_ID = "author1";

// テストモードかどうかのフラグ
let isTestMode = false;

// テストモードを設定する関数
export function setTestMode(testMode: boolean): void {
  isTestMode = testMode;
}

// auth関数を取得する関数
export async function getAuth() {
  // テストモードの場合は固定値を返す
  if (isTestMode) {
    return { userId: TEST_USER_ID };
  }

  try {
    // 本番環境では実際のClerk認証を使用
    return await clerkAuth();
  } catch (error) {
    console.error("認証エラー:", error);
    return { userId: null };
  }
}
