"use client";

import { createCallable } from "react-call";
import { playlist } from "./consts";
import { useVideoPlayer } from "./hooks";
import { MultiVideoPlayer } from "./multi-video-player";
import { VideoPlayerBar } from "./video-player-bar";

export const { Root, ...VideoPlayer } = createCallable(({ call }) => {
  const { state, handlers } = useVideoPlayer({ videoList: playlist.videos });

  return (
    <>
      <MultiVideoPlayer state={state} handlers={handlers} playlist={playlist} handlePlayerClose={() => call.end()} />
      <VideoPlayerBar state={state} handlers={handlers} playlist={playlist} handlePlayerClose={() => call.end()} />
    </>
  );
});
