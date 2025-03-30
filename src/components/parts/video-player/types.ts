import type { Dispatch, SetStateAction } from "react";

export type PlayerState = {
  currentIndex: number;
  isStarted: boolean;
  isPlaying: boolean;
  isShuffleMode: boolean;
  isLoopMode: boolean;
  isPlayerBarMode: boolean;
};

export type PlayerHandlers = {
  onReady: (event: { target: { playVideo: () => void } }) => void;
  onEnd: () => void;
  handleStart: () => void;
  handlePlayPause: () => void;
  handlePreviousTrack: () => void;
  handleNextTrack: () => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  togglePlayerMode: () => void;
  setState: Dispatch<SetStateAction<PlayerState>>;
};
