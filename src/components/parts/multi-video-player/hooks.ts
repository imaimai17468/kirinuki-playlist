import { useRef, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import type { VideoItem } from "./types";

interface PlayerState {
  currentIndex: number;
  isStarted: boolean;
  isPlaying: boolean;
  isShuffleMode: boolean;
  isLoopMode: boolean;
}

interface UseMultiVideoPlayerProps {
  videoList: VideoItem[];
}

export const useMultiVideoPlayer = ({ videoList }: UseMultiVideoPlayerProps) => {
  const [state, setState] = useState<PlayerState>({
    currentIndex: 0,
    isStarted: false,
    isPlaying: true,
    isShuffleMode: false,
    isLoopMode: false,
  });
  const playerRef = useRef<YouTubePlayer | null>(null);

  const getNextIndex = () => {
    if (state.isShuffleMode) {
      const availableIndices = Array.from({ length: videoList.length }, (_, i) => i).filter(
        (i) => i !== state.currentIndex,
      );

      if (availableIndices.length === 0) {
        return state.isLoopMode ? Math.floor(Math.random() * videoList.length) : state.currentIndex;
      }

      return availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    return state.currentIndex < videoList.length - 1
      ? state.currentIndex + 1
      : state.isLoopMode
        ? 0
        : state.currentIndex;
  };

  const getPreviousIndex = () => {
    if (state.isShuffleMode) {
      return Math.floor(Math.random() * videoList.length);
    }

    return state.currentIndex > 0
      ? state.currentIndex - 1
      : state.isLoopMode
        ? videoList.length - 1
        : state.currentIndex;
  };

  const toggleShuffle = () => {
    setState((prev) => ({ ...prev, isShuffleMode: !prev.isShuffleMode }));
  };

  const toggleLoop = () => {
    setState((prev) => ({ ...prev, isLoopMode: !prev.isLoopMode }));
  };

  const onReady = (event: { target: { playVideo: () => void } }) => {
    playerRef.current = event.target;
    if (state.isStarted) {
      event.target.playVideo();
    }
  };

  const onEnd = () => {
    const nextIndex = getNextIndex();
    if (nextIndex !== state.currentIndex) {
      setState((prev) => ({ ...prev, currentIndex: nextIndex }));
    }
  };

  const handleStart = () => {
    setState((prev) => ({ ...prev, isStarted: true }));
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    if (state.isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handlePreviousTrack = () => {
    const prevIndex = getPreviousIndex();
    if (prevIndex !== state.currentIndex) {
      setState((prev) => ({ ...prev, currentIndex: prevIndex }));
    }
  };

  const handleNextTrack = () => {
    const nextIndex = getNextIndex();
    if (nextIndex !== state.currentIndex) {
      setState((prev) => ({ ...prev, currentIndex: nextIndex }));
    }
  };

  return {
    state,
    playerRef,
    handlers: {
      onReady,
      onEnd,
      handleStart,
      handlePlayPause,
      handlePreviousTrack,
      handleNextTrack,
      toggleShuffle,
      toggleLoop,
    },
  };
};
