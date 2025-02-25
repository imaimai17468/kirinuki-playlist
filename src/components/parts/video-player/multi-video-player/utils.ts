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
