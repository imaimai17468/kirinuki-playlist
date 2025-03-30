"use client";

import type { Playlist } from "@/repositories/playlists/types";
import { createCallable } from "react-call";
import { useVideoPlayer } from "./hooks";
import { MultiVideoPlayer } from "./multi-video-player";
import { VideoPlayerBar } from "./video-player-bar";

type Props = {
  playlist: Playlist;
};

export const { Root, ...VideoPlayer } = createCallable<Props>(({ call, playlist }) => {
  if (!playlist.videos) {
    throw new Error("playlist.videos is undefined");
  }

  const { state, handlers } = useVideoPlayer({ videoList: playlist.videos });

  return (
    <>
      <MultiVideoPlayer
        state={state}
        handlers={handlers}
        playlist={playlist}
        videoList={playlist.videos}
        handlePlayerClose={() => call.end()}
      />
      <VideoPlayerBar
        state={state}
        handlers={handlers}
        videoList={playlist.videos}
        handlePlayerClose={() => call.end()}
      />
    </>
  );
});
