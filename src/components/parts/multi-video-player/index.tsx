"use client";

import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import YouTube from "react-youtube";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { useMultiVideoPlayer } from "./hooks";
import { extractVideoId, getPlayerOpts, videoList } from "./utils";

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
  } = useMultiVideoPlayer({ videoList });

  const currentVideo = videoList[state.currentIndex];
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
            <YouTube videoId={videoId} opts={opts} onReady={onReady} onEnd={onEnd} />
            <div className="flex justify-center">
              <p className="text-sm font-bold">{currentVideo.title}</p>
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
              {videoList.map((video, index) => (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};
