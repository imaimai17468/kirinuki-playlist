import type { VideoItem } from "./types";

export const videoList: VideoItem[] = [
  {
    url: "https://www.youtube.com/watch?v=Z06b1AteZIc",
    start: 10,
    end: 20,
    title: "あーぱつあぱつ",
  },
  {
    url: "https://www.youtube.com/watch?v=NWewLXfQ-O4",
    start: 20,
    end: 30,
    title: "チャイちゃんかわいい",
  },
  {
    url: "https://www.youtube.com/watch?v=2i90HwFactc",
    start: 30,
    end: 40,
    title: "レンタルぶさいくおかえり",
  },
  {
    url: "https://www.youtube.com/watch?v=24-t00rZ28o",
    start: 40,
    end: 50,
    title: "ぽんぽこバトル",
  },
];

export const getPlayerOpts = (start: number, end: number) => ({
  width: "100%",
  height: "100%",
  playerVars: {
    autoplay: 1,
    start,
    end,
  },
});

export const extractVideoId = (url: string) => {
  const regExp = /(?:\?v=|\/embed\/|\.be\/)([^&#]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};
