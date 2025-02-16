"use client";

import { useState } from "react";
import YouTube from "react-youtube";
import { Button } from "../ui/button";

// 複数動画のリスト
const videoList = [
  { url: "https://www.youtube.com/watch?v=Z06b1AteZIc", start: 10, end: 20 },
  { url: "https://www.youtube.com/watch?v=NWewLXfQ-O4", start: 20, end: 30 },
];

// URLから videoId を抽出する関数
const extractVideoId = (url: string) => {
  const regExp = /(?:\?v=|\/embed\/|\.be\/)([^&#]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export const MultiVideoPlayer = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false); // ユーザー操作済みかどうか

  const currentVideo = videoList[currentIndex];
  const videoId = extractVideoId(currentVideo.url);

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 1,
      start: currentVideo.start,
      end: currentVideo.end,
    },
  };

  // ユーザー操作後にプレイヤーを再生開始
  const onReady = (event: { target: { playVideo: () => void } }) => {
    if (isStarted) {
      event.target.playVideo();
    }
  };

  // 動画終了時に次の動画へ切り替え
  const onEnd = () => {
    if (currentIndex < videoList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // ユーザーが明示的に再生開始するためのボタン
  const handleStart = () => {
    setIsStarted(true);
  };

  return (
    <div>
      {!isStarted ? (
        <Button type="button" onClick={handleStart}>
          再生開始
        </Button>
      ) : (
        <YouTube videoId={videoId} opts={opts} onReady={onReady} onEnd={onEnd} />
      )}
    </div>
  );
};
