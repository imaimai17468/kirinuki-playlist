"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { followUser, isFollowing, unfollowUser } from "@/repositories/follows";
import { useClerk } from "@clerk/nextjs";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

interface FollowButtonProps {
  userId: string;
  className?: string;
}

export const FollowButton = ({ userId, className }: FollowButtonProps) => {
  const { toast } = useToast();
  const { user } = useClerk();
  const [loading, setLoading] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 現在のフォロー状態を取得
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (!user) {
          setInitialLoading(false);
          return;
        }

        const result = await isFollowing(userId);
        if (result.isOk()) {
          setIsFollowed(result.value);
        }
      } catch (error) {
        console.error("フォロー状態の確認中にエラーが発生しました", error);
      } finally {
        setInitialLoading(false);
      }
    };

    checkFollowStatus();
  }, [user, userId]);

  const handleFollow = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ログインが必要です",
      });
      return;
    }

    setLoading(true);
    try {
      if (isFollowed) {
        // フォロー解除
        const result = await unfollowUser(userId);
        if (result.isOk()) {
          setIsFollowed(false);
          toast({
            title: "成功",
            description: "フォローを解除しました",
          });
        } else {
          toast({
            variant: "destructive",
            title: "エラー",
            description: result.error.message || "フォロー解除に失敗しました",
          });
        }
      } else {
        // フォロー
        const result = await followUser(userId);
        if (result.isOk()) {
          setIsFollowed(true);
          toast({
            title: "成功",
            description: "フォローしました",
          });
        } else {
          toast({
            variant: "destructive",
            title: "エラー",
            description: result.error.message || "フォローに失敗しました",
          });
        }
      }
    } catch (error) {
      console.error("フォロー処理中にエラーが発生しました", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "処理中にエラーが発生しました",
      });
    } finally {
      setLoading(false);
    }
  };

  // 自分自身の場合はボタンを表示しない
  if (user?.id === userId) {
    return null;
  }

  // アイコンの決定: 状態に応じたデフォルトアイコン
  const buttonIcon =
    loading || initialLoading ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : isFollowed ? (
      <UserMinus className="mr-2 h-4 w-4" />
    ) : (
      <UserPlus className="mr-2 h-4 w-4" />
    );

  return (
    <Button
      onClick={handleFollow}
      variant={isFollowed ? "outline" : "default"}
      className={className}
      disabled={loading || initialLoading}
    >
      {buttonIcon}
      {isFollowed ? "フォロー解除" : "フォローする"}
    </Button>
  );
};
