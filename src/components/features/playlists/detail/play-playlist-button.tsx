"use client";

import { VideoPlayer } from "@/components/parts/video-player";
import { Button } from "@/components/ui/button";
import type { Playlist } from "@/repositories/playlists/types";
import { ListMusic } from "lucide-react";

type Props = {
  playlist: Playlist;
};

export function PlayPlaylistButton({ playlist }: Props) {
  const handlePlay = async () => {
    // react-callを使用してVideoPlayerを呼び出す
    await VideoPlayer.call({ playlist });
  };

  return (
    <Button onClick={handlePlay}>
      <ListMusic className="h-4 w-4 mr-2" />
      Play Playlist
    </Button>
  );
}
