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

export const AUTH_REQUIRED_PATHS_ARRAY = Object.values(AUTH_REQUIRED_PATHS);

// パブリックルート（認証不要）
export const PUBLIC_PATHS = {
  HOME: "/",
  CLIPS: "/clips",
  USERS: "/users",
  PLAYLISTS: "/playlists",
  TAGS: "/tags",
  LOGIN_REQUIRED: "/login-required",
} as const;

// 詳細パス
export const DETAIL_PATH = {
  CLIP_DETAIL: "/clips/(.*)",
  USER_DETAIL: "/users/(.*)",
  PLAYLIST_DETAIL: "/playlists/(.*)",
  TAG_DETAIL: "/tags/(.*)",
} as const;

export const CLIENT_PATH = {
  ...PUBLIC_PATHS,
  ...DETAIL_PATH,
  ...AUTH_REQUIRED_PATHS,
} as const;

// 詳細ページのパラメータ付きURL生成関数
export const getDetailPath = (pattern: keyof typeof DETAIL_PATH, id: string): string => {
  // キー名からURLパスに変換
  const urlPath = pattern.replace("_DETAIL", "").toLowerCase();
  return `/${urlPath}s/${encodeURIComponent(id)}`;
};
