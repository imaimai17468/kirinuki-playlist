import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_REQUIRED_PATHS, getAllPublicPaths } from "../consts/clientpath";

// 保護ルートマッチャー
const isProtectedRoutePattern = (path: string) => {
  // すべてのAPIルートは保護対象
  if (path.startsWith("/api/")) {
    return true;
  }

  // APIでないパスは AUTH_REQUIRED_PATHS のみを保護
  return Object.values(AUTH_REQUIRED_PATHS).some((protectedPath) => {
    const regex = new RegExp(`^${protectedPath.replace(/\(.*\)/g, ".*")}$`);
    return regex.test(path);
  });
};

// パブリックルートパターン
const isPublicRoutePattern = (path: string) => {
  // APIパスはすべて非公開
  if (path.startsWith("/api/")) {
    return false;
  }

  // パブリックパスのリスト
  const publicPaths = [
    ...getAllPublicPaths(),
    "/login-required", // ログイン要求ページも公開
  ];

  // 認証系パスと公開パスはパブリック
  return publicPaths.some((publicPath) => {
    const regex = new RegExp(`^${publicPath.replace(/\(.*\)/g, ".*")}$`);
    return regex.test(path);
  });
};

// ミドルウェア関数
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ユーザーセッションを取得 (実際のセッション処理は後で実装)
  const userId = request.cookies.get("__session")?.value;

  // APIルートの保護: 未認証の場合は401エラー
  if (pathname.startsWith("/api/") && !userId) {
    return new NextResponse(
      JSON.stringify({
        error: "Unauthorized",
        message: "Authentication required to access this API",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // 保護されたページの場合: 未認証ユーザーはログイン要求ページにリダイレクト
  if (
    !pathname.startsWith("/api/") &&
    !isPublicRoutePattern(pathname) &&
    isProtectedRoutePattern(pathname) &&
    !userId
  ) {
    // ログイン要求ページにリダイレクト（元のURLをredirectクエリパラメータに保存）
    const loginRequiredUrl = new URL("/login-required", request.url);
    loginRequiredUrl.searchParams.set("redirect", request.url);
    return NextResponse.redirect(loginRequiredUrl);
  }

  // それ以外はリクエスト続行
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|.*\\.(js|css|ico|png|webp|jpg|jpeg|svg)).*)",
    // Always run for API routes
    "/api/(.*)",
  ],
};
