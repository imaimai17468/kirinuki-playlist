"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ListMusic, PanelBottomClose, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import Link from "next/link";
import YouTube from "react-youtube";
import type { PlayerHandlers, PlayerState } from "../types";
import type { Playlist } from "../types";
import { extractVideoId, getPlayerOpts } from "./utils";

type MultiVideoPlayerProps = {
  state: PlayerState;
  handlers: PlayerHandlers;
  playlist: Playlist;
};

export const MultiVideoPlayer: React.FC<MultiVideoPlayerProps> = ({ state, handlers, playlist }) => {
  const currentVideo = playlist.videos[state.currentIndex];
  const videoId = extractVideoId(currentVideo.url);
  const opts = getPlayerOpts(currentVideo.start, currentVideo.end);

  return (
    <div>
      {!state.isStarted ? (
        <Button type="button" onClick={handlers.handleStart}>
          再生開始
        </Button>
      ) : (
        <Card
          className={cn(
            "pt-6 w-96 fixed bottom-4 right-4 transition-transform duration-200 ease-in-out",
            state.isPlayerBarMode && "translate-y-full",
          )}
        >
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between">
              <Link
                href={`/playlists/${playlist.id}`}
                className="flex items-center gap-1 text-gray-500 hover:underline"
              >
                <ListMusic className="w-4 h-4" />
                <p className="text-xs">{playlist.title}</p>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="video-player-close (player-bar-open)"
                onClick={handlers.togglePlayerMode}
              >
                <PanelBottomClose />
              </Button>
            </div>
            <YouTube videoId={videoId} opts={opts} onReady={handlers.onReady} onEnd={handlers.onEnd} />
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
                onClick={handlers.toggleShuffle}
                className={state.isShuffleMode ? "text-green-500 hover:text-green-500" : ""}
                aria-label="シャッフル"
              >
                <Shuffle />
              </Button>
              <Button variant="ghost" size="icon" onClick={handlers.handlePreviousTrack} aria-label="前の動画">
                <SkipBack />
              </Button>
              <Button size="icon" onClick={handlers.handlePlayPause} className="rounded-full" aria-label="再生/停止">
                {state.isPlaying ? <Pause /> : <Play />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handlers.handleNextTrack} aria-label="次の動画">
                <SkipForward />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlers.toggleLoop}
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
                      handlers.setState((prev) => ({
                        ...prev,
                        currentIndex: index,
                      }));
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
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={playlist.author.iconUrl} />
                <AvatarFallback>{playlist.author.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <Link href={`/users/${playlist.author.id}`} className="text-sm hover:opacity-70 transition-opacity">
                {playlist.author.name}
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
