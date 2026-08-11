export const colors = {
  nearBlack: "#050505",
  surface: "#0a0a0a",
  cherry: "#8b1a2b",
  cherryBright: "#c41e3a",
  amber: "#e8a04a",
  amberSoft: "#c47a2a",
  cream: "#f2ebe3",
  chrome: "#c8cdd4",
  chromeDark: "#6b7280",
  vinyl: "#0d0d0d",
  groove: "#161616",
  label: "#1a0f0c",
} as const;

export type ColorToken = keyof typeof colors;
