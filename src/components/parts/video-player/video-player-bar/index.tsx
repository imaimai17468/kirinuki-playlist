"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { PanelBottomClose, Pause, Play, SkipBack, SkipForward, SquareX } from "lucide-react";
import type { PlayerHandlers, PlayerState, Playlist } from "../types";

type VideoPlayerBarProps = {
  state: PlayerState;
  handlers: PlayerHandlers;
  playlist: Playlist;
  handlePlayerClose: () => void;
};

export const VideoPlayerBar: React.FC<VideoPlayerBarProps> = ({ state, handlers, playlist, handlePlayerClose }) => {
  const { state: sidebarState } = useSidebar();
  const currentVideo = playlist.videos[state.currentIndex];

  return (
    <div
      className={cn(
        "fixed bottom-0 right-0 border-t bg-white duration-200 transition-[width,transform] ease-linear p-3",
        sidebarState === "collapsed"
          ? "w-[calc(100%-var(--sidebar-width-icon))]"
          : "w-[calc(100%-var(--sidebar-width))]",
        !state.isPlayerBarMode && "translate-y-full",
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handlers.togglePlayerMode}
            aria-label="player-bar-close (video-player-open)"
          >
            <PanelBottomClose />
          </Button>
          <Separator orientation="vertical" className="h-6 mr-2" />
          <div className="flex flex-col">
            <p className="font-bold text-sm">{currentVideo.title}</p>
            <p className="text-xs text-gray-500">{currentVideo.movieTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlers.handlePreviousTrack} aria-label="前の動画">
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button size="icon" onClick={handlers.handlePlayPause} className="rounded-full" aria-label="再生/停止">
            {state.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handlers.handleNextTrack} aria-label="次の動画">
            <SkipForward className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500 hover:text-red-500 hover:bg-red-500/10"
            onClick={handlePlayerClose}
            aria-label="player-close"
          >
            <SquareX />
          </Button>
        </div>
      </div>
    </div>
  );
};
