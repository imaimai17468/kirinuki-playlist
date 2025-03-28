import type { YouTubeProps } from "react-youtube";

export const createYoutubeOpts = (start: number, end: number): YouTubeProps["opts"] => {
  return {
    width: "100%",
    height: "100%",
    aspectRatio: "16/9",
    playerVars: {
      autoplay: 1,
      start: start,
      end: end,
    },
  };
};
