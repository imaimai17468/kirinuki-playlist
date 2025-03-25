export const getPlayerOpts = (start: number, end: number) => ({
  width: "100%",
  height: "100%",
  playerVars: {
    autoplay: 1,
    start,
    end,
  },
});
