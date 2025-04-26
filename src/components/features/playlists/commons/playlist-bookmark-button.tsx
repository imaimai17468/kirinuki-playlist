"use client";

import { Button } from "@/components/ui/button";
import { usePlaylistBookmarkMutations, usePlaylistBookmarkStatus } from "@/repositories/playlist_bookmarks/hooks";
import { useUser } from "@clerk/nextjs";
import { Bookmark as BookmarkIcon, Loader2 } from "lucide-react";

type PlaylistBookmarkButtonProps = {
  playlistId: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
};

export const PlaylistBookmarkButton = ({
  playlistId,
  className = "",
  variant = "outline",
  size = "default",
  showText = false,
}: PlaylistBookmarkButtonProps) => {
  const { user, isSignedIn } = useUser();
  const userId = user?.id ?? "";

  // ブックマーク状態を取得
  const { data: isBookmarked = false, isLoading: isChecking } = usePlaylistBookmarkStatus(
    userId,
    playlistId,
    !!isSignedIn,
  );

  // ブックマーク追加・削除のミューテーション
  const { isLoading: isMutating, toggleBookmark } = usePlaylistBookmarkMutations(userId, playlistId);

  // ローディング状態
  const isLoading = isChecking || isMutating;

  // ユーザーがログインしていない場合は表示しない
  if (!isSignedIn || !user) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${
        isBookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={() => toggleBookmark(isBookmarked)}
      disabled={isLoading}
      title={isBookmarked ? "Bookmarked" : "Bookmark"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <BookmarkIcon className={`h-4 w-4 ${showText ? "mr-2" : ""}`} fill={isBookmarked ? "currentColor" : "none"} />
      )}
      {showText && (isBookmarked ? "Bookmarked" : "Bookmark")}
    </Button>
  );
};
