export type ManualTheme = "light" | "dark";

export function normalizeManualTheme(theme: unknown): ManualTheme {
  return theme === "dark" ? "dark" : "light";
}
