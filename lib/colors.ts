export const colors = {
  ivory: "#f7f1ea",
  pearl: "#f3e9ef",
  blush: "#f0d0d8",
  pink: "#e8b7c6",
  lavender: "#d7c6e6",
  beige: "#e8dccf",
  mist: "#efe8f2",
  champagne: "#d9c4a5",
  chrome: "#c8ced8",
  ink: "#3a3140",
  inkSoft: "#6b5f74",
  glass: "rgba(255, 255, 255, 0.42)",
  vinyl: "#1c1822",
  groove: "#2a2432",
} as const;

export type ColorToken = keyof typeof colors;
