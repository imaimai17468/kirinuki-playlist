"use client";

import { playlist } from "./consts";
import { useVideoPlayer } from "./hooks";
import { MultiVideoPlayer } from "./multi-video-player";
import { VideoPlayerBar } from "./video-player-bar";

export const VideoPlayer: React.FC = () => {
  const { state, handlers } = useVideoPlayer({ videoList: playlist.videos });

  return (
    <>
      <MultiVideoPlayer state={state} handlers={handlers} playlist={playlist} />
      <VideoPlayerBar state={state} handlers={handlers} playlist={playlist} />
    </>
  );
};
