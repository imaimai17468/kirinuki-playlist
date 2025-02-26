"use client";

import { VideoPlayer } from "@/components/parts/video-player";
import { Button } from "@/components/ui/button";

export const TestButton = () => {
  const handleOpenVideoPlayer = async () => {
    await VideoPlayer.call();
  };
  return (
    <div>
      <h1>testbutton</h1>
      <Button onClick={handleOpenVideoPlayer}>open VideoPlayer</Button>
    </div>
  );
};
