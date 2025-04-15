"use client";

import { Button } from "@/components/ui/button";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { useFollowButton } from "./hooks";

interface FollowButtonProps {
  userId: string;
  userName?: string;
  className?: string;
}

export const FollowButton = ({ userId, userName, className }: FollowButtonProps) => {
  const { state, handleFollow, shouldShowButton, user } = useFollowButton(userId, userName);

  // ログインしていない場合、または自分自身の場合はボタンを表示しない
  if (!user || !shouldShowButton) {
    return null;
  }

  // アイコンの決定: 状態に応じたデフォルトアイコン
  const buttonIcon = state.loading ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : state.isFollowed ? (
    <UserMinus className="mr-2 h-4 w-4" />
  ) : (
    <UserPlus className="mr-2 h-4 w-4" />
  );

  return (
    <Button
      onClick={handleFollow}
      variant={state.isFollowed ? "outline" : "default"}
      className={className}
      disabled={state.loading}
    >
      {buttonIcon}
      {state.isFollowed ? "Unfollow" : "Follow"}
    </Button>
  );
};
