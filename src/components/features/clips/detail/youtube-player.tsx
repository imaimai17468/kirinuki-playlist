"use client";

import { getYoutubeId } from "@/utils/youtube";
import YouTube from "react-youtube";
import { createYoutubeOpts } from "./consts";

type Props = {
  url: string;
  start: number;
  end: number;
};

export const YoutubePlayer = ({ url, start, end }: Props) => {
  return (
    <YouTube
      videoId={getYoutubeId(url)}
      opts={createYoutubeOpts(start, end)}
      style={{ width: "100%", height: "100%" }}
    />
  );
};
