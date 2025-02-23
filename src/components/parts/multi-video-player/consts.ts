import type { Playlist, VideoItem } from "./types";

export const videoList: VideoItem[] = [
  {
    url: "https://www.youtube.com/watch?v=Z06b1AteZIc",
    start: 10,
    end: 20,
    title: "あーぱつあぱつ",
    movieTitle: "【重音テトSV・フリモメンSV】APT.(ROSÉ & Bruno Mars)【SynthV cover】",
    channelName: "ちりん",
  },
  {
    url: "https://www.youtube.com/watch?v=NWewLXfQ-O4",
    start: 20,
    end: 30,
    title: "チャイちゃんかわいい",
    movieTitle:
      "当時えるえるに言えなかった不満を暴露する花畑チャイカ【ドーラ】【シスタークレア】【手描き】【にじさんじ】",
    channelName: "ごるみ【手書き切り抜き】",
  },
  {
    url: "https://www.youtube.com/watch?v=2i90HwFactc",
    start: 30,
    end: 40,
    title: "レンタルぶさいくおかえり",
    movieTitle:
      "レンタルぶさいく救出編が完結！帰国を出迎えにキモシェアメンバーが集結！【フィリピン編・スウェーデン編】",
    channelName: "バキ童チャンネル【ぐんぴぃ】",
  },
  {
    url: "https://www.youtube.com/watch?v=24-t00rZ28o",
    start: 40,
    end: 50,
    title: "ぽんぽこバトル",
    movieTitle: "【ラップバトル】MCガチ恋ぽんぽこ VS MCぽんぽこ",
    channelName: "ぽんぽこちゃんねる",
  },
];

export const playlist: Playlist = {
  id: "1",
  title: "テストプレイリスト",
  author: {
    id: "1",
    name: "imaimai",
    iconUrl: "https://pbs.twimg.com/profile_images/1624795237003726849/VDPRKgCK_400x400.jpg",
  },
  videos: videoList,
};
