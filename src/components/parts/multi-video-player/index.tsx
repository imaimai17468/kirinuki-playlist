"use client";

import { ListMusic, PanelBottomClose, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import Link from "next/link";
import YouTube from "react-youtube";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { playlist } from "./consts";
import { useMultiVideoPlayer } from "./hooks";
import { extractVideoId, getPlayerOpts } from "./utils";

export const MultiVideoPlayer = () => {
  const {
    state,
    handlers: {
      onReady,
      onEnd,
      handleStart,
      handlePlayPause,
      handlePreviousTrack,
      handleNextTrack,
      toggleShuffle,
      toggleLoop,
      setState,
    },
  } = useMultiVideoPlayer({ videoList: playlist.videos });

  const currentVideo = playlist.videos[state.currentIndex];
  const videoId = extractVideoId(currentVideo.url);
  const opts = getPlayerOpts(currentVideo.start, currentVideo.end);

  return (
    <div>
      {!state.isStarted ? (
        <Button type="button" onClick={handleStart}>
          再生開始
        </Button>
      ) : (
        <Card className="pt-6 w-96 fixed bottom-4 right-4">
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between">
              <Link
                href={`/playlists/${playlist.id}`}
                className="flex items-center gap-1 text-gray-500 hover:underline"
              >
                <ListMusic className="w-4 h-4" />
                <p className="text-xs">{playlist.title}</p>
              </Link>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <PanelBottomClose />
              </Button>
            </div>
            <YouTube videoId={videoId} opts={opts} onReady={onReady} onEnd={onEnd} />
            <div className="flex flex-col gap-2">
              <p className="self-center text-sm font-bold">{currentVideo.title}</p>
              <div className="overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent z-10" />
                <p className="text-sm text-gray-500 whitespace-nowrap animate-marquee">
                  {`${currentVideo.movieTitle} - ${currentVideo.channelName}`}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={state.isShuffleMode ? "text-green-500 hover:text-green-500" : ""}
                aria-label="シャッフル"
              >
                <Shuffle />
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePreviousTrack} aria-label="前の動画">
                <SkipBack />
              </Button>
              <Button size="icon" onClick={handlePlayPause} className="rounded-full" aria-label="再生/停止">
                {state.isPlaying ? <Pause /> : <Play />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextTrack} aria-label="次の動画">
                <SkipForward />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLoop}
                className={state.isLoopMode ? "text-green-500 hover:text-green-500" : ""}
                aria-label="ループ"
              >
                <Repeat />
              </Button>
            </div>
            <div className="flex flex-col max-h-48 overflow-y-auto">
              {playlist.videos.map((video, index) => (
                <button
                  type="button"
                  key={video.url}
                  onClick={() => {
                    if (index !== state.currentIndex) {
                      setState((prev) => ({ ...prev, currentIndex: index }));
                    }
                  }}
                  disabled={index === state.currentIndex}
                  className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors
                    ${
                      index === state.currentIndex
                        ? "bg-green-500/10 text-green-500"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  {video.title}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={playlist.author.iconUrl} />
                <AvatarFallback>{playlist.author.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <p>{playlist.author.name}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
