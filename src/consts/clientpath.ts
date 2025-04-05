export const AUTH_REQUIRED_PATHS = {
  FAVORITES: "/favorites",
  FOLLOWING: "/following",
  MY_CLIPS: "/my-clips",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  SETTINGS_NOTIFICATIONS: "/settings/notifications",
  SETTINGS_ACCOUNT: "/settings/account",
  SETTINGS_BILLING: "/settings/billing",
} as const;

// パブリックルート（認証不要）
export const PUBLIC_PATHS = {
  HOME: "/",
  CLIPS: "/clips",
  USERS: "/users",
  PLAYLISTS: "/playlists",
  TAGS: "/tags",
  LOGIN_REQUIRED: "/login-required",
} as const;

// 認証関連パス (モーダル認証のため実際にルートとしては存在しない)
export const AUTH_PATHS = {
  SIGN_IN: "#sign-in-modal",
  SIGN_UP: "#sign-up-modal",
} as const;

// API関連パス
export const API_PATHS = {
  BASE: "/api/(.*)",
} as const;

// 詳細パス
export const DETAIL_PATH = {
  CLIPS: "/clips/(.*)",
  USERS: "/users/(.*)",
  PLAYLISTS: "/playlists/(.*)",
  TAGS: "/tags/(.*)",
} as const;

export const CLIENT_PATH = {
  ...PUBLIC_PATHS,
  ...DETAIL_PATH,
  ...AUTH_REQUIRED_PATHS,
  ...AUTH_PATHS,
} as const;

// 詳細ページのパラメータ付きURL生成関数
export const getDetailPath = (pattern: keyof typeof DETAIL_PATH, id: string): string => {
  // キー名からURLパスに変換
  const urlPath = pattern.toLowerCase();
  return `/${urlPath}/${encodeURIComponent(id)}`;
};

// 公開パスにはパブリックパスと詳細パターンとAUTHパスを含める
export const getAllPublicPaths = () => {
  return [...Object.values(PUBLIC_PATHS), ...Object.values(DETAIL_PATH), ...Object.values(AUTH_PATHS)];
};
