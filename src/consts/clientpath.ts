const DETAIL_PATH = {
  CLIP_DETAIL: "/clips/:id",
  USERS_DETAIL: "/users/:id",
} as const;

export const CLIENT_PATH = {
  HOME: "/",
  CLIPS: "/clips",
  USERS: "/users",
  ...DETAIL_PATH,
} as const;

type DetailPath = (typeof DETAIL_PATH)[keyof typeof DETAIL_PATH];

export const getDetailPath = (path: DetailPath, id: string) => {
  return path.replace(":id", id);
};
