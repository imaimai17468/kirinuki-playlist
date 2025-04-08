"use client";

import { useToast } from "@/hooks/use-toast";
import { getAuthorById } from "@/repositories/authors";
import { followUser, isFollowing, unfollowUser } from "@/repositories/follows";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface FollowState {
  loading: boolean;
  isFollowed: boolean;
  targetUserName: string;
}

export function useFollowButton(userId: string, userName?: string) {
  const { toast } = useToast();
  const { user } = useClerk();
  const [state, setState] = useState<FollowState>({
    loading: true,
    isFollowed: false,
    targetUserName: userName || "",
  });

  // 初期化：ユーザー名の取得とフォロー状態の確認
  useEffect(() => {
    const initialize = async () => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        // ユーザー名を取得（userName propsがない場合）
        if (!userName && userId) {
          const nameResult = await getAuthorById(userId);
          if (nameResult.isOk()) {
            setState((prev) => ({
              ...prev,
              targetUserName: nameResult.value.name,
            }));
          }
        }

        // フォロー状態を確認（ユーザーがログインしている場合）
        if (user) {
          const followResult = await isFollowing(userId);
          if (followResult.isOk()) {
            setState((prev) => ({
              ...prev,
              isFollowed: followResult.value,
            }));
          }
        }
      } catch (error) {
        console.error("初期化中にエラーが発生しました", error);
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    initialize();
  }, [user, userId, userName]);

  // フォロー/アンフォロー処理
  const handleFollow = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "ログインが必要です",
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      if (state.isFollowed) {
        // フォロー解除
        const result = await unfollowUser(userId);
        if (result.isOk()) {
          setState((prev) => ({ ...prev, isFollowed: false }));
          toast({
            title: "Unfollowed",
            description: `You have unfollowed ${state.targetUserName}`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error.message || "Failed to unfollow user",
          });
        }
      } else {
        // フォロー
        const result = await followUser(userId);
        if (result.isOk()) {
          setState((prev) => ({ ...prev, isFollowed: true }));
          toast({
            title: "Following",
            description: `You are now following ${state.targetUserName}`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error.message || "Failed to follow user",
          });
        }
      }
    } catch (error) {
      console.error("フォロー処理中にエラーが発生しました", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during the process",
      });
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // 自分自身へのフォローボタンを表示するかどうか
  const shouldShowButton = user?.id !== userId;

  return {
    state,
    handleFollow,
    shouldShowButton,
    user,
  };
}
