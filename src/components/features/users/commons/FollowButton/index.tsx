"use client";

import { Button } from "@/components/ui/button";
import { useFollowMutations, useFollowStatus } from "@/repositories/follows/follows_hooks";
import { useClerk } from "@clerk/nextjs";
import { Loader2, UserMinus, UserPlus } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  userName: string;
  className?: string;
}

export const FollowButton = ({ userId, userName, className }: FollowButtonProps) => {
  const { user, isSignedIn } = useClerk();
  const loggedInUserId = user?.id;

  // フォロー状態を取得
  const { data: isFollowed = false, isLoading: isStatusLoading } = useFollowStatus(userId, !!isSignedIn);

  // フォロー操作のミューテーション
  const { isLoading: isMutating, toggleFollow } = useFollowMutations(userId, userName);

  // ローディング状態の結合
  const isLoading = isStatusLoading || isMutating;

  // ログインしていない場合、または自分自身の場合はボタンを表示しない
  const shouldShowButton = !!isSignedIn && loggedInUserId !== userId;
  if (!shouldShowButton) {
    return null;
  }

  // アイコンの決定: 状態に応じたデフォルトアイコン
  const buttonIcon = isLoading ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : isFollowed ? (
    <UserMinus className="mr-2 h-4 w-4" />
  ) : (
    <UserPlus className="mr-2 h-4 w-4" />
  );

  return (
    <Button
      onClick={() => toggleFollow(isFollowed)}
      variant={isFollowed ? "outline" : "default"}
      className={className}
      disabled={isLoading}
    >
      {buttonIcon}
      {isFollowed ? "Unfollow" : "Follow"}
    </Button>
  );
};
