"use client";

import { useToast } from "@/hooks/use-toast";
import { getAuthorById } from "@/repositories/authors";
import { followUser, isFollowing, unfollowUser } from "@/repositories/follows";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

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
  const initializedRef = useRef(false);
  const initialNameFetchedRef = useRef(false);
  const initialFollowStatusFetchedRef = useRef(false);

  // ユーザー名の取得
  useEffect(() => {
    // すでにuserNameが提供されているか、初期化済みの場合はスキップ
    if (userName || initialNameFetchedRef.current || !userId) return;

    const fetchUserName = async () => {
      try {
        const nameResult = await getAuthorById(userId);
        if (nameResult.isOk()) {
          setState((prev) => ({
            ...prev,
            targetUserName: nameResult.value.name,
          }));
        }
      } catch (error) {
        console.error("ユーザー名取得中にエラーが発生しました", error);
      } finally {
        initialNameFetchedRef.current = true;
      }
    };

    fetchUserName();
  }, [userId, userName]);

  // フォロー状態の確認
  useEffect(() => {
    // ユーザーが未ログインか、すでに初期化済みの場合はスキップ
    if (!user || initialFollowStatusFetchedRef.current || !userId) return;

    const fetchFollowStatus = async () => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        const followResult = await isFollowing(userId);
        if (followResult.isOk()) {
          setState((prev) => ({
            ...prev,
            isFollowed: followResult.value,
          }));
        }
      } catch (error) {
        console.error("フォロー状態確認中にエラーが発生しました", error);
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
        initialFollowStatusFetchedRef.current = true;
        initializedRef.current = true;
      }
    };

    fetchFollowStatus();
  }, [user, userId]);

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
            variant: "success",
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
            variant: "success",
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
