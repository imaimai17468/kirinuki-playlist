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

  // Get user name
  useEffect(() => {
    // Skip if userName is provided or already initialized
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
        console.error("Error occurred while fetching user name", error);
      } finally {
        initialNameFetchedRef.current = true;
      }
    };

    fetchUserName();
  }, [userId, userName]);

  // Check follow status
  useEffect(() => {
    // Skip if user is not logged in or already initialized
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
        console.error("Error occurred while fetching follow status", error);
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
        initialFollowStatusFetchedRef.current = true;
        initializedRef.current = true;
      }
    };

    fetchFollowStatus();
  }, [user, userId]);

  // Follow/unfollow process
  const handleFollow = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Login required",
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      if (state.isFollowed) {
        // Unfollow
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
        // Follow
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
      console.error("Error occurred during follow/unfollow process", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during the process",
      });
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Check whether to show follow button
  // Don't show button if user is not logged in or is the current user
  const shouldShowButton = !!user && user.id !== userId;

  return {
    state,
    handleFollow,
    shouldShowButton,
    user,
  };
}
