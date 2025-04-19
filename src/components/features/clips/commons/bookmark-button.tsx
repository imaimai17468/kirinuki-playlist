"use client";

import { Button } from "@/components/ui/button";
import { useBookmarkMutations, useBookmarkStatus } from "@/db/services/video_bookmarks/video_bookmarks_hooks";
import { useUser } from "@clerk/nextjs";
import { Bookmark as BookmarkIcon, Loader2 } from "lucide-react";

type BookmarkButtonProps = {
  videoId: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
};

export const BookmarkButton = ({
  videoId,
  className = "",
  variant = "outline",
  size = "default",
  showText = false,
}: BookmarkButtonProps) => {
  const { user, isSignedIn } = useUser();
  const userId = user?.id ?? "";

  // ブックマーク状態を取得
  const { data: isBookmarked = false, isLoading: isChecking } = useBookmarkStatus(userId, videoId, !!isSignedIn);

  // ブックマーク追加・削除のミューテーション
  const { isLoading: isMutating, toggleBookmark } = useBookmarkMutations(userId, videoId);

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
      title={isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <BookmarkIcon className={`h-4 w-4 ${showText ? "mr-2" : ""}`} fill={isBookmarked ? "currentColor" : "none"} />
      )}
      {showText && (isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks")}
    </Button>
  );
};
