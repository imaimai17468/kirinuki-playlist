export type VideoItem = {
  url: string;
  start: number;
  end: number;
  title: string;
  movieTitle: string;
  channelName: string;
};

export type Author = {
  id: string;
  name: string;
  iconUrl: string;
};

export type Playlist = {
  id: string;
  title: string;
  author: Author;
  videos: VideoItem[];
};
