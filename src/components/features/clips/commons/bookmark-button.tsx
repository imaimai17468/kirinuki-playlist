"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { bookmarkVideo, hasBookmarkedVideo, unbookmarkVideo } from "@/repositories/authors";
import { useUser } from "@clerk/nextjs";
import { Bookmark as BookmarkIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!isSignedIn || !user?.id) return;

      setIsLoading(true);
      try {
        const result = await hasBookmarkedVideo(user.id, videoId);
        if (result.isOk()) {
          setIsBookmarked(result.value);
        }
      } catch (error) {
        console.error("Failed to check bookmark status", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkBookmarkStatus();
  }, [user?.id, videoId, isSignedIn]);

  // Don't display if the user is not logged in
  if (!isSignedIn || !user) {
    return null;
  }

  const handleToggleBookmark = async () => {
    setIsLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const result = await unbookmarkVideo(user.id, videoId);
        if (result.isOk()) {
          setIsBookmarked(false);
          toast({
            title: "Bookmark Removed",
            description: "The video has been removed from your bookmarks",
          });
        } else {
          throw new Error(result.error.message);
        }
      } else {
        // Add bookmark
        const result = await bookmarkVideo(user.id, videoId);
        if (result.isOk()) {
          setIsBookmarked(true);
          toast({
            title: "Bookmark Added",
            description: "The video has been added to your bookmarks",
          });
        } else {
          throw new Error(result.error.message);
        }
      }
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
      toast({
        title: "Error",
        description: "An error occurred while processing your bookmark request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${
        isBookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={handleToggleBookmark}
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
