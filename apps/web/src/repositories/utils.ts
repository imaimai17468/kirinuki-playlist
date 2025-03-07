import { nanoid } from "nanoid";

/**
 * ランダムなUIDを生成する
 * @param size UIDの長さ（デフォルト: 21文字）
 * @returns 生成されたUID
 */
export function generateUid(size = 21): string {
  return nanoid(size);
}
